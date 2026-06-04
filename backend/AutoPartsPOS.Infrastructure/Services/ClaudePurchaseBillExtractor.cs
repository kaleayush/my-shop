using System.IO;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using AutoPartsPOS.Application.Interfaces.Services;

namespace AutoPartsPOS.Infrastructure.Services;

public class ClaudePurchaseBillExtractor : IPurchaseBillTextExtractor
{
    private const string Endpoint = "https://api.anthropic.com/v1/messages";
    private const string Model = "claude-haiku-4-5-20251001";
    private const string AnthropicVersion = "2023-06-01";

    private const string Prompt =
        "Extract all product line items from this purchase bill. " +
        "Return ONLY a valid JSON array — no markdown, no explanation, no extra text. " +
        "Each element must have exactly these fields: " +
        "{\"name\":\"product name\",\"qty\":2,\"mrp\":1000.0,\"purchasePrice\":750.0}. " +
        "Include only actual product rows. " +
        "Exclude header rows, subtotal, total, paid, pending, and any summary rows.";

    private readonly HttpClient _http;
    private readonly string _apiKey;

    public ClaudePurchaseBillExtractor(HttpClient http, string apiKey)
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

        // Claude uses "document" type for PDFs, "image" for images
        var isPdf = mimeType == "application/pdf";
        object fileContent2 = isPdf
            ? new { type = "document", source = new { type = "base64", media_type = mimeType, data = base64 } }
            : new { type = "image",    source = new { type = "base64", media_type = mimeType, data = base64 } };

        var requestBody = new
        {
            model = Model,
            max_tokens = 2048,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = new object[]
                    {
                        fileContent2,
                        new { type = "text", text = Prompt }
                    }
                }
            }
        };

        try
        {
            var bodyJson = JsonSerializer.Serialize(requestBody);

            int[] delaysSeconds = [2, 5, 15];
            HttpResponseMessage? lastResponse = null;
            for (int attempt = 0; attempt <= delaysSeconds.Length; attempt++)
            {
                lastResponse?.Dispose();
                using var request = new HttpRequestMessage(HttpMethod.Post, Endpoint)
                {
                    Content = new StringContent(bodyJson, Encoding.UTF8, "application/json")
                };
                request.Headers.Add("x-api-key", _apiKey);
                request.Headers.Add("anthropic-version", AnthropicVersion);

                lastResponse = await _http.SendAsync(request, ct);

                if ((int)lastResponse.StatusCode != 429 || attempt == delaysSeconds.Length)
                    break;

                int waitSec = delaysSeconds[attempt];
                if (lastResponse.Headers.TryGetValues("Retry-After", out var vals) &&
                    int.TryParse(vals.FirstOrDefault(), out var ra))
                    waitSec = ra;

                await Task.Delay(TimeSpan.FromSeconds(waitSec), ct);
            }

            using var response = lastResponse!;
            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync(ct);
            var items = ParseClaudeResponse(json);

            if (items is null || items.Count == 0)
            {
                return new PurchaseBillExtractedText(
                    string.Empty,
                    UsedOcr: true,
                    NeedsOcr: false,
                    Status: "Claude processed the bill but found no product line items.",
                    Items: []);
            }

            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: true,
                NeedsOcr: false,
                Status: $"Claude AI extracted {items.Count} items from the bill.",
                Items: items);
        }
        catch (Exception ex)
        {
            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: false,
                NeedsOcr: true,
                Status: $"Claude extraction failed: {ex.Message}. Please enter items manually.");
        }
    }

    private static IReadOnlyList<ExtractedBillItem>? ParseClaudeResponse(string responseJson)
    {
        using var root = JsonDocument.Parse(responseJson);

        // Navigate: content[0].text
        var text = root.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString();

        if (string.IsNullOrWhiteSpace(text)) return null;

        var start = text.IndexOf('[');
        var end   = text.LastIndexOf(']');
        if (start < 0 || end <= start) return null;
        text = text[start..(end + 1)];

        using var itemsDoc = JsonDocument.Parse(text);
        var items = new List<ExtractedBillItem>();

        foreach (var el in itemsDoc.RootElement.EnumerateArray())
        {
            var name  = el.TryGetProperty("name", out var n) ? n.GetString() ?? "" : "";
            var qty   = el.TryGetProperty("qty",  out var q) ? q.GetInt32()        : 0;
            var mrp   = el.TryGetProperty("mrp",  out var m) ? m.GetDecimal()      : 0;
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
            ".pdf"            => "application/pdf",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png"            => "image/png",
            ".gif"            => "image/gif",
            ".bmp"            => "image/bmp",
            ".webp"           => "image/webp",
            _                 => "application/pdf"
        };
    }
}
