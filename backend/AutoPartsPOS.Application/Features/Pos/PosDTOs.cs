using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Application.Features.Pos;

public record CreateDraftSaleRequest(
    string? CustomerName,
    string? CustomerPhone
);

public record AddDraftSaleItemRequest(
    Guid ProductId,
    Guid InventoryBatchId,
    int Quantity,
    decimal SellingPrice
);

public record UpdateDraftSaleItemRequest(
    int Quantity,
    decimal SellingPrice
);

public record CompleteDraftSaleRequest(
    decimal PaidAmount,
    PaymentMode PaymentMode,
    string? Notes,
    string? CustomerName,
    string? CustomerPhone
);

public record DraftSaleItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid InventoryBatchId,
    Guid DealerId,
    string DealerName,
    string BatchNumber,
    int Quantity,
    decimal MRP,
    decimal SellingPrice,
    decimal LineTotal,
    decimal? PurchasePriceSnapshot,
    string PurchasePriceCodeSnapshot
);

public record DraftSaleResponse(
    Guid Id,
    string DraftNumber,
    string? CustomerName,
    string? CustomerPhone,
    DraftSaleStatus Status,
    decimal TotalAmount,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<DraftSaleItemResponse> Items
);

public record SaleItemResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid InventoryBatchId,
    string DealerName,
    string BatchNumber,
    int Quantity,
    decimal MRP,
    decimal SellingPrice,
    decimal LineTotal,
    decimal? PurchasePriceSnapshot,
    string PurchasePriceCodeSnapshot,
    decimal? ProfitAmount
);

public record PaymentResponse(
    Guid Id,
    decimal Amount,
    PaymentMode PaymentMode,
    string? Notes,
    DateTime CreatedAt
);

public record SaleResponse(
    Guid Id,
    string SaleNumber,
    Guid DraftSaleId,
    string? CustomerName,
    string? CustomerPhone,
    decimal TotalAmount,
    decimal PaidAmount,
    decimal PendingAmount,
    decimal? ProfitAmount,
    SalePaymentStatus PaymentStatus,
    DateTime CreatedAt,
    IReadOnlyList<SaleItemResponse> Items,
    IReadOnlyList<PaymentResponse> Payments
);
