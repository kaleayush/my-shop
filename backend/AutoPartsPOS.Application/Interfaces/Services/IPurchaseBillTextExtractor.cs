namespace AutoPartsPOS.Application.Interfaces.Services;

public interface IPurchaseBillTextExtractor
{
    Task<PurchaseBillExtractedText> ExtractAsync(Stream fileContent, string fileName, string? contentType, CancellationToken ct = default);
}

public record PurchaseBillExtractedText(
    string Text,
    bool UsedOcr,
    bool NeedsOcr,
    string Status,
    IReadOnlyList<ExtractedBillItem>? Items = null
);

public record ExtractedBillItem(string Name, int Qty, decimal Mrp, decimal PurchasePrice);
