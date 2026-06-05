using System.Net.Http;
using System.Text;
using System.Text.Json;
using AutoPartsPOS.Application.Interfaces.Services;

namespace AutoPartsPOS.Infrastructure.Services;

public class ClaudeProductLineParser : IClaudeProductLineParser
{
    private const string Endpoint = "https://api.anthropic.com/v1/messages";
    private const string Model = "claude-haiku-4-5-20251001";
    private const string AnthropicVersion = "2023-06-01";

    private const string Prompt =
        "Extract only product line items from this purchase bill text.\n\n" +
        "Return ONLY a valid JSON array.\n" +
        "No markdown, no explanation, no extra text.\n\n" +
        "Each item must have exactly these fields:\n" +
        "{\n  \"name\": \"product name\",\n  \"qty\": 0,\n  \"mrp\": 0,\n  \"purchasePrice\": 0\n}\n\n" +
        "Rules:\n" +
        "- Include only actual product rows.\n" +
        "- Exclude dealer name, bill number, bill date, subtotal, total, paid, pending, balance, GST, tax, discount, and summary rows.\n" +
        "- If qty is missing, use 1 only when the row is clearly a product row.\n" +
        "- If mrp is missing, use 0.\n" +
        "- If purchase price is missing, use 0.\n" +
        "- Do not guess product names.\n" +
        "- Do not include duplicate header rows.";

    private static readonly string[] ExcludedTerms =
        ["subtotal", "total", "paid", "pending", "tax", "gst", "balance"];

    private readonly HttpClient _http;
    private readonly string _apiKey;

    public ClaudeProductLineParser(HttpClient http, string apiKey)
    {
        _http = http;
        _apiKey = apiKey;
    }

    public async Task<IReadOnlyList<ExtractedBillItem>> ParseFromTextAsync(
        string billText, CancellationToken ct = default)
    {
        var userMessage = $"{Prompt}\n\n{billText}";
        var requestBody = new
        {
            model = Model,
            max_tokens = 2048,
            messages = new[]
            {
                new { role = "user", content = userMessage }
            }
        };

        var responseJson = await SendRequestAsync(requestBody, ct);
        return ParseClaudeResponse(responseJson);
    }

    public async Task<IReadOnlyList<ExtractedBillItem>> ParseFromDocumentAsync(
        byte[] fileBytes, string mimeType, CancellationToken ct = default)
    {
        var base64 = Convert.ToBase64String(fileBytes);
        var isPdf = mimeType == "application/pdf";

        object fileBlock = isPdf
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
                        fileBlock,
                        new { type = "text", text = Prompt }
                    }
                }
            }
        };

        var responseJson = await SendRequestAsync(requestBody, ct);
        return ParseClaudeResponse(responseJson);
    }

    private async Task<string> SendRequestAsync(object requestBody, CancellationToken ct)
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
        return await response.Content.ReadAsStringAsync(ct);
    }

    private static IReadOnlyList<ExtractedBillItem> ParseClaudeResponse(string responseJson)
    {
        try
        {
            using var root = JsonDocument.Parse(responseJson);
            var text = root.RootElement
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString();

            if (string.IsNullOrWhiteSpace(text)) return [];

            var start = text.IndexOf('[');
            var end   = text.LastIndexOf(']');
            if (start < 0 || end <= start) return [];
            text = text[start..(end + 1)];

            using var itemsDoc = JsonDocument.Parse(text);
            var items = new List<ExtractedBillItem>();

            foreach (var el in itemsDoc.RootElement.EnumerateArray())
            {
                var name = el.TryGetProperty("name", out var n) ? n.GetString()?.Trim() ?? "" : "";

                var qty = 0;
                if (el.TryGetProperty("qty", out var q) && q.ValueKind == JsonValueKind.Number)
                    qty = (int)q.GetDecimal();

                var mrp = el.TryGetProperty("mrp", out var m) && m.ValueKind == JsonValueKind.Number
                    ? m.GetDecimal() : 0;

                var price = el.TryGetProperty("purchasePrice", out var p) && p.ValueKind == JsonValueKind.Number
                    ? p.GetDecimal()
                    : el.TryGetProperty("purchase_price", out var p2) && p2.ValueKind == JsonValueKind.Number
                        ? p2.GetDecimal() : 0;

                if (!IsValidItem(name, qty, mrp, price)) continue;
                items.Add(new ExtractedBillItem(name, qty, mrp, price));
            }

            return items;
        }
        catch
        {
            return [];
        }
    }

    private static bool IsValidItem(string name, int qty, decimal mrp, decimal purchasePrice)
    {
        if (string.IsNullOrWhiteSpace(name)) return false;
        if (qty <= 0) return false;
        if (mrp < 0) return false;
        if (purchasePrice < 0) return false;

        var lower = name.ToLowerInvariant();
        foreach (var term in ExcludedTerms)
            if (lower.Contains(term)) return false;

        return true;
    }
}
