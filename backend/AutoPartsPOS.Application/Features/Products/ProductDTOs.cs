namespace AutoPartsPOS.Application.Features.Products;

public record ProductSearchRequest(
    string? Query,
    Guid? CategoryId,
    Guid? DealerId,
    bool IncludeInactive = false
);

public record CreateProductRequest(
    string ProductName,
    Guid? CategoryId,
    Guid? BrandId,
    Guid? BikeCompanyId,
    Guid? BikeModelId,
    Guid? ColorId,
    Guid? GraphicId,
    decimal MRP,
    string? HindiName,
    string? SearchKeywords,
    string? Barcode,
    string? QRCode,
    int MinimumStockQuantity
);

public record UpdateProductRequest(
    string ProductName,
    Guid? CategoryId,
    Guid? BrandId,
    Guid? BikeCompanyId,
    Guid? BikeModelId,
    Guid? ColorId,
    Guid? GraphicId,
    decimal MRP,
    string? HindiName,
    string? SearchKeywords,
    string? Barcode,
    string? QRCode,
    int MinimumStockQuantity,
    bool IsActive
);

public record AddProductImageRequest(
    string ImageUrl,
    bool IsPrimary
);

public record ProductImageResponse(
    Guid Id,
    string ImageUrl,
    bool IsPrimary,
    DateTime CreatedAt
);

public record ProductBatchSummaryResponse(
    Guid Id,
    Guid DealerId,
    string DealerName,
    string BatchNumber,
    decimal MRP,
    decimal? PurchasePrice,
    string PurchasePriceCode,
    int CurrentQuantity,
    int ReservedQuantity,
    int AvailableQuantity,
    int MinimumStockQuantity,
    DateTime PurchaseDate,
    bool IsLowStock
);

public record ProductResponse(
    Guid Id,
    string ProductName,
    Guid? CategoryId,
    string? CategoryName,
    Guid? BrandId,
    string? BrandName,
    Guid? BikeCompanyId,
    string? BikeCompanyName,
    Guid? BikeModelId,
    string? BikeModelName,
    Guid? ColorId,
    string? ColorName,
    Guid? GraphicId,
    string? GraphicName,
    decimal MRP,
    string? HindiName,
    string? SearchKeywords,
    string? Barcode,
    string? QRCode,
    int MinimumStockQuantity,
    int TotalQuantity,
    int ReservedQuantity,
    int AvailableQuantity,
    string? PrimaryImageUrl,
    bool IsActive
);

public record ProductDetailResponse(
    Guid Id,
    string ProductName,
    Guid? CategoryId,
    string? CategoryName,
    Guid? BrandId,
    string? BrandName,
    Guid? BikeCompanyId,
    string? BikeCompanyName,
    Guid? BikeModelId,
    string? BikeModelName,
    Guid? ColorId,
    string? ColorName,
    Guid? GraphicId,
    string? GraphicName,
    decimal MRP,
    string? HindiName,
    string? SearchKeywords,
    string? Barcode,
    string? QRCode,
    int MinimumStockQuantity,
    int TotalQuantity,
    int ReservedQuantity,
    int AvailableQuantity,
    bool IsActive,
    IReadOnlyList<ProductImageResponse> Images,
    IReadOnlyList<ProductBatchSummaryResponse> Batches
);
