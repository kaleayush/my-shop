using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using AutoPartsPOS.Application.Interfaces.Services;

namespace AutoPartsPOS.Infrastructure.Services;

public class GeminiPurchaseBillExtractor : IPurchaseBillTextExtractor
{
    private static readonly string Endpoint =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private const string Prompt =
        "Extract all product line items from this purchase bill. " +
        "Return ONLY a valid JSON array — no markdown, no explanation, no extra text. " +
        "Each element must have exactly these fields: " +
        "{\"name\":\"product name\",\"qty\":2,\"mrp\":1000.0,\"purchasePrice\":750.0}. " +
        "Include only actual product rows. " +
        "Exclude header rows, subtotal, total, paid, pending, and any summary rows.";

    private readonly HttpClient _http;
    private readonly string _apiKey;

    public GeminiPurchaseBillExtractor(HttpClient http, string apiKey)
    {
        _http = http;
        _apiKey = apiKey;
    }

    public async Task<PurchaseBillExtractedText> ExtractAsync(
        Stream fileContent, string fileName, string? contentType, CancellationToken ct = default)
    {
        using var memory = new MemoryStream();
        await fileContent.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();
        var base64 = Convert.ToBase64String(bytes);
        var mimeType = ResolveMimeType(fileName, contentType);

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new object[]
                    {
                        new { inline_data = new { mime_type = mimeType, data = base64 } },
                        new { text = Prompt }
                    }
                }
            },
            generationConfig = new { responseMimeType = "application/json" }
        };

        try
        {
            var url = $"{Endpoint}?key={_apiKey}";
            using var request = new HttpRequestMessage(HttpMethod.Post, url)
            {
                Content = new StringContent(
                    JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json")
            };

            using var response = await _http.SendAsync(request, ct);
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(ct);
            var items = ParseGeminiResponse(json);

            if (items is null || items.Count == 0)
            {
                return new PurchaseBillExtractedText(
                    string.Empty,
                    UsedOcr: true,
                    NeedsOcr: false,
                    Status: "Gemini processed the bill but found no product line items.",
                    Items: []);
            }

            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: true,
                NeedsOcr: false,
                Status: $"Gemini AI extracted {items.Count} items from the bill.",
                Items: items);
        }
        catch (Exception ex)
        {
            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: false,
                NeedsOcr: true,
                Status: $"Gemini extraction failed: {ex.Message}. Please enter items manually.");
        }
    }

    private static IReadOnlyList<ExtractedBillItem>? ParseGeminiResponse(string responseJson)
    {
        using var root = JsonDocument.Parse(responseJson);

        // Navigate: candidates[0].content.parts[0].text
        var text = root.RootElement
            .GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(text)) return null;

        // Strip any accidental markdown fences
        text = text.Trim();
        if (text.StartsWith("```")) text = text[text.IndexOf('[')..];
        if (text.EndsWith("```")) text = text[..text.LastIndexOf(']')];

        using var itemsDoc = JsonDocument.Parse(text.Trim());
        var items = new List<ExtractedBillItem>();

        foreach (var el in itemsDoc.RootElement.EnumerateArray())
        {
            var name = el.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
            var qty  = el.TryGetProperty("qty",  out var q) ? q.GetInt32()     : 0;
            var mrp  = el.TryGetProperty("mrp",  out var m) ? m.GetDecimal()   : 0;
            var price = el.TryGetProperty("purchasePrice", out var p)
                ? p.GetDecimal()
                : el.TryGetProperty("purchase_price", out var p2) ? p2.GetDecimal() : 0;

            if (string.IsNullOrWhiteSpace(name) || qty <= 0) continue;
            items.Add(new ExtractedBillItem(name.Trim(), qty, mrp, price));
        }

        return items;
    }

    private static string ResolveMimeType(string fileName, string? contentType)
    {
        if (!string.IsNullOrWhiteSpace(contentType) &&
            contentType != "application/octet-stream")
            return contentType;

        return Path.GetExtension(fileName).ToLowerInvariant() switch
        {
            ".pdf"          => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png"          => "image/png",
            ".gif"          => "image/gif",
            ".bmp"          => "image/bmp",
            ".webp"         => "image/webp",
            _               => "application/pdf"
        };
    }
}
