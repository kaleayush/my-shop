using System.IO;
using System.Text;
using System.Text.RegularExpressions;
using AutoPartsPOS.Application.Interfaces.Services;
using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;

namespace AutoPartsPOS.Infrastructure.Services;

public partial class PurchaseBillTextExtractor : IPurchaseBillTextExtractor
{
    public async Task<PurchaseBillExtractedText> ExtractAsync(Stream fileContent, string fileName, string? contentType, CancellationToken ct = default)
    {
        using var memory = new MemoryStream();
        await fileContent.CopyToAsync(memory, ct);
        var bytes = memory.ToArray();

        var isPdf = IsPdf(fileName, contentType, bytes);

        if (!isPdf && IsImage(fileName, contentType))
        {
            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: false,
                NeedsOcr: true,
                Status: "Image file uploaded. Automatic text extraction is not supported for images — please enter items manually.");
        }

        var text = isPdf ? ExtractPdfText(bytes) : Encoding.UTF8.GetString(bytes);
        text = NormalizeText(text);

        if (string.IsNullOrWhiteSpace(text))
        {
            return new PurchaseBillExtractedText(
                string.Empty,
                UsedOcr: false,
                NeedsOcr: true,
                Status: "No text could be extracted from this file. It may be a scanned/image PDF — please enter items manually.");
        }

        return new PurchaseBillExtractedText(
            text,
            UsedOcr: false,
            NeedsOcr: false,
            Status: isPdf ? "PDF text extracted successfully." : "Text file content extracted for review.");
    }

    // ── PDF extraction ────────────────────────────────────────────────────────

    private static string ExtractPdfText(byte[] bytes)
    {
        try
        {
            using var document = PdfDocument.Open(bytes);
            var sb = new StringBuilder();

            foreach (var page in document.GetPages())
            {
                var allWords = page.GetWords()
                    .OrderBy(w => -w.BoundingBox.Top)
                    .ThenBy(w => w.BoundingBox.Left)
                    .ToList();

                if (allWords.Count == 0) continue;

                var lines = GroupIntoLines(allWords, tolerance: 3.0);
                var columns = DetectTableColumns(lines);

                if (columns is not null)
                {
                    foreach (var line in lines)
                    {
                        var productName = ExtractColumn(line, columns.Product).Trim();
                        var qty        = ExtractColumn(line, columns.Qty).Trim();
                        var mrp        = ExtractColumn(line, columns.Mrp).Trim();
                        var price      = ExtractColumn(line, columns.Purchase).Trim();

                        if (string.IsNullOrEmpty(productName)) continue;
                        if (!int.TryParse(qty, out _)) continue;
                        if (!decimal.TryParse(mrp, out _)) continue;
                        if (!decimal.TryParse(price, out _)) continue;

                        sb.AppendLine($"{productName}|{qty}|{mrp}|{price}");
                    }
                }
                else
                {
                    // Fallback: raw text lines (no table structure detected)
                    foreach (var line in lines)
                        sb.AppendLine(string.Join(" ", line.Select(w => w.Text)));
                }
            }

            return sb.ToString();
        }
        catch
        {
            return string.Empty;
        }
    }

    // ── Column detection ──────────────────────────────────────────────────────

    private record ColumnRange(double Left, double Right);
    private record TableColumnMap(ColumnRange Product, ColumnRange Qty, ColumnRange Mrp, ColumnRange Purchase);

    private static TableColumnMap? DetectTableColumns(List<List<Word>> lines)
    {
        foreach (var line in lines)
        {
            Word? productHdr = null, qtyHdr = null, mrpHdr = null, purchaseHdr = null;

            foreach (var word in line)
            {
                var t = word.Text.ToUpperInvariant();
                if (t == "PRODUCT") productHdr = word;
                else if (t == "QTY") qtyHdr = word;
                else if (t == "MRP") mrpHdr = word;
                else if (t is "PURCHASE" or "PRICE" or "RATE") purchaseHdr = word;
            }

            if (productHdr is null || qtyHdr is null || mrpHdr is null) continue;

            var productRange  = new ColumnRange(productHdr.BoundingBox.Left, qtyHdr.BoundingBox.Left);
            var qtyRange      = new ColumnRange(qtyHdr.BoundingBox.Left, mrpHdr.BoundingBox.Left);

            double mrpRight      = purchaseHdr?.BoundingBox.Left ?? mrpHdr.BoundingBox.Right + 60;
            var mrpRange         = new ColumnRange(mrpHdr.BoundingBox.Left, mrpRight);

            double purchaseRight = purchaseHdr is not null ? purchaseHdr.BoundingBox.Right + 40 : mrpRight + 60;
            var purchaseRange    = purchaseHdr is not null
                ? new ColumnRange(purchaseHdr.BoundingBox.Left, purchaseRight)
                : new ColumnRange(mrpRight, purchaseRight);

            return new TableColumnMap(productRange, qtyRange, mrpRange, purchaseRange);
        }

        return null;
    }

    private static string ExtractColumn(List<Word> line, ColumnRange range) =>
        string.Join(" ", line
            .Where(w => w.BoundingBox.Left >= range.Left - 5 && w.BoundingBox.Left < range.Right)
            .OrderBy(w => w.BoundingBox.Left)
            .Select(w => w.Text));

    // ── Line grouping ─────────────────────────────────────────────────────────

    private static List<List<Word>> GroupIntoLines(List<Word> words, double tolerance)
    {
        var lines = new List<List<Word>>();
        List<Word>? current = null;
        double lastY = double.MaxValue;

        foreach (var word in words)
        {
            var y = word.BoundingBox.Top;
            if (current is null || Math.Abs(y - lastY) > tolerance)
            {
                current = [];
                lines.Add(current);
                lastY = y;
            }
            current.Add(word);
        }

        return lines;
    }

    // ── File type helpers ─────────────────────────────────────────────────────

    private static bool IsPdf(string fileName, string? contentType, byte[] bytes) =>
        fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase) ||
        string.Equals(contentType, "application/pdf", StringComparison.OrdinalIgnoreCase) ||
        bytes is [0x25, 0x50, 0x44, 0x46, ..];

    private static bool IsImage(string fileName, string? contentType)
    {
        var ext = Path.GetExtension(fileName);
        if (ext.Equals(".jpg",  StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".jpeg", StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".png",  StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".gif",  StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".bmp",  StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".tiff", StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".tif",  StringComparison.OrdinalIgnoreCase) ||
            ext.Equals(".webp", StringComparison.OrdinalIgnoreCase))
            return true;
        return contentType is not null && contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase);
    }

    // ── Text normalisation ────────────────────────────────────────────────────

    private static string NormalizeText(string text)
    {
        var normalized = text.Replace("\r\n", "\n").Replace('\r', '\n');
        var lines = normalized
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(line => MultiSpaceRegex().Replace(line.Trim(), " "))
            .Where(line => !string.IsNullOrWhiteSpace(line));

        return string.Join('\n', lines);
    }

    [GeneratedRegex(@"\s{2,}", RegexOptions.Compiled)]
    private static partial Regex MultiSpaceRegex();
}
