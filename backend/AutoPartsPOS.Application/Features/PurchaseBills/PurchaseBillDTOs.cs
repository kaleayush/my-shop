using System.IO;
using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Application.Features.PurchaseBills;

public class UploadPurchaseBillRequest
{
    public Guid DealerId { get; init; }
    public string? BillNumber { get; init; }
    public DateTime BillDate { get; init; }
    public decimal TotalAmount { get; init; }
    public decimal PaidAmount { get; init; }
    public string FileName { get; init; } = string.Empty;
    public string? ContentType { get; init; }
    public Stream FileContent { get; init; } = Stream.Null;
}

public record MapPurchaseBillItemRequest(
    Guid PurchaseBillItemId,
    Guid ProductId
);

public record CreateProductFromPurchaseBillItemRequest(
    Guid PurchaseBillItemId,
    string ProductName,
    int MinimumStockQuantity
);

public record ConfirmPurchaseBillRequest(
    decimal PaidAmount,
    IReadOnlyList<ConfirmPurchaseBillItemRequest> Items
);

public record ConfirmPurchaseBillItemRequest(
    Guid PurchaseBillItemId,
    Guid ProductId,
    string RawProductName,
    int Quantity,
    decimal Mrp,
    decimal PurchasePrice
);

public record PurchaseBillReviewResponse(
    Guid Id,
    Guid DealerId,
    string DealerName,
    string BillNumber,
    DateTime BillDate,
    string? UploadedFileUrl,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal PendingAmount,
    PurchaseBillStatus Status,
    string ExtractionStatus,
    string? RawExtractedText,
    IReadOnlyList<PurchaseBillItemResponse> Items
);

public record PurchaseBillItemResponse(
    Guid Id,
    Guid? ProductId,
    string? ProductName,
    string RawProductName,
    int Quantity,
    decimal Mrp,
    decimal PurchasePrice,
    Guid? SuggestedProductId,
    string? SuggestedProductName,
    decimal MatchConfidence,
    bool IsConfirmed
);
