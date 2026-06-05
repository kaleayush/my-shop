namespace AutoPartsPOS.Application.Interfaces.Services;

public interface IClaudeProductLineParser
{
    Task<IReadOnlyList<ExtractedBillItem>> ParseFromTextAsync(string billText, CancellationToken ct = default);
    Task<IReadOnlyList<ExtractedBillItem>> ParseFromDocumentAsync(byte[] fileBytes, string mimeType, CancellationToken ct = default);
}
