using System.Text;
using System.Text.RegularExpressions;
using AutoPartsPOS.Application.Interfaces.Services;

namespace AutoPartsPOS.Infrastructure.Services;

public partial class PurchaseBillTextExtractor : IPurchaseBillTextExtractor
{
    public async Task<PurchaseBillExtractedText> ExtractAsync(Stream fileContent, string fileName, string? contentType, CancellationToken ct = default)
    {
        using var memory = new MemoryStream();
        await fileContent.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();

        var isPdf = IsPdf(fileName, contentType, bytes);
        var text = isPdf ? ExtractPdfLiteralText(bytes) : Encoding.UTF8.GetString(bytes);
        text = NormalizeText(text);

        if (string.IsNullOrWhiteSpace(text))
        {
            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: false,
                NeedsOcr: true,
                Status: "No typed PDF text found. OCR placeholder marked this bill for manual review.");
        }

        return new PurchaseBillExtractedText(
            text,
            UsedOcr: false,
            NeedsOcr: false,
            Status: isPdf ? "Typed PDF text extracted for review." : "Text file content extracted for review.");
    }

    private static bool IsPdf(string fileName, string? contentType, byte[] bytes) =>
        fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(contentType, "application/pdf", StringComparison.OrdinalIgnoreCase) ||
        bytes is [0x25, 0x50, 0x44, 0x46, ..];

    private static string ExtractPdfLiteralText(byte[] bytes)
    {
        var raw = Encoding.Latin1.GetString(bytes);
        var builder = new StringBuilder();

        foreach (Match match in PdfLiteralTextRegex().Matches(raw))
        {
            var value = match.Groups["text"].Value
                .Replace(@"\\", "\\")
                .Replace(@"\(", "(")
                .Replace(@"\)", ")")
                .Replace(@"\n", "\n")
                .Replace(@"\r", "\n")
                .Replace(@"\t", " ");

            if (!LooksLikePdfCommand(value))
                builder.AppendLine(value);
        }

        return builder.ToString();
    }

    private static bool LooksLikePdfCommand(string value) =>
        value.Length <= 2 || value.All(c => char.IsControl(c) || char.IsPunctuation(c));

    private static string NormalizeText(string text)
    {
        var normalized = text.Replace("\r\n", "\n").Replace('\r', '\n');
        var lines = normalized
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(line => MultiSpaceRegex().Replace(line.Trim(), " "))
            .Where(line => !string.IsNullOrWhiteSpace(line));

        return string.Join('\n', lines);
    }

    [GeneratedRegex(@"\((?<text>(?:\\.|[^\\)])*)\)", RegexOptions.Compiled)]
    private static partial Regex PdfLiteralTextRegex();

    [GeneratedRegex(@"\s{2,}", RegexOptions.Compiled)]
    private static partial Regex MultiSpaceRegex();
}
