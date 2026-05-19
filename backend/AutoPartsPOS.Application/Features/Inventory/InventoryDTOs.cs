namespace AutoPartsPOS.Application.Features.Inventory;

public record CreateInventoryBatchRequest(
    Guid ProductId,
    Guid DealerId,
    string? BatchNumber,
    decimal MRP,
    decimal PurchasePrice,
    int Quantity,
    int MinimumStockQuantity,
    DateTime PurchaseDate
);

public record UpdateInventoryBatchRequest(
    string BatchNumber,
    decimal MRP,
    decimal PurchasePrice,
    int CurrentQuantity,
    int ReservedQuantity,
    int SoldQuantity,
    int DamagedQuantity,
    int MinimumStockQuantity,
    DateTime PurchaseDate,
    bool IsActive
);

public record AdjustInventoryRequest(
    Guid InventoryBatchId,
    int QuantityDelta,
    string? Reason
);

public record InventoryBatchResponse(
    Guid Id,
    Guid ProductId,
    string ProductName,
    Guid DealerId,
    string DealerName,
    string BatchNumber,
    decimal MRP,
    decimal? PurchasePrice,
    string PurchasePriceCode,
    int InitialQuantity,
    int CurrentQuantity,
    int ReservedQuantity,
    int AvailableQuantity,
    int SoldQuantity,
    int DamagedQuantity,
    int MinimumStockQuantity,
    DateTime PurchaseDate,
    bool IsLowStock,
    bool IsActive
);
