using System.IO;
using AutoPartsPOS.Application.Interfaces.Services;

namespace AutoPartsPOS.Infrastructure.Services;

public class ClaudePurchaseBillExtractor : IPurchaseBillTextExtractor
{
    private readonly IPdfTextExtractor _pdfExtractor;
    private readonly IClaudeProductLineParser _parser;

    public ClaudePurchaseBillExtractor(IPdfTextExtractor pdfExtractor, IClaudeProductLineParser parser)
    {
        _pdfExtractor = pdfExtractor;
        _parser = parser;
    }

    public async Task<PurchaseBillExtractedText> ExtractAsync(
        Stream fileContent, string fileName, string? contentType, CancellationToken ct = default)
    {
        using var memory = new MemoryStream();
        await fileContent.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();
        var mimeType = ResolveMimeType(fileName, contentType);
        var isPdf = mimeType == "application/pdf";

        try
        {
            IReadOnlyList<ExtractedBillItem> items;
            bool usedOcr;
            string rawText;
            string status;

            if (isPdf)
            {
                var extractedText = _pdfExtractor.ExtractText(bytes);
                if (extractedText.Length > 100)
                {
                    items = await _parser.ParseFromTextAsync(extractedText, ct);
                    usedOcr = false;
                    rawText = extractedText;
                    status = items.Count > 0
                        ? $"Typed PDF text extracted locally and Claude parsed {items.Count} items."
                        : "Claude processed the bill but found no product line items.";
                }
                else
                {
                    items = await _parser.ParseFromDocumentAsync(bytes, mimeType, ct);
                    usedOcr = true;
                    rawText = string.Empty;
                    status = items.Count > 0
                        ? $"Scanned PDF processed by Claude and extracted {items.Count} items."
                        : "Claude processed the bill but found no product line items.";
                }
            }
            else
            {
                items = await _parser.ParseFromDocumentAsync(bytes, mimeType, ct);
                usedOcr = true;
                rawText = string.Empty;
                status = items.Count > 0
                    ? $"Scanned PDF processed by Claude and extracted {items.Count} items."
                    : "Claude processed the bill but found no product line items.";
            }

            return new PurchaseBillExtractedText(rawText, usedOcr, NeedsOcr: false, status, items);
        }
        catch
        {
            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: false,
                NeedsOcr: true,
                Status: "Extraction failed. Please enter items manually.",
                Items: []);
        }
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
