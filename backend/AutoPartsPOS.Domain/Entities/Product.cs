namespace AutoPartsPOS.Domain.Entities;

public class Product : AuditableEntity
{
    public Guid ShopId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public Guid? CategoryId { get; set; }
    public Guid? BrandId { get; set; }
    public Guid? BikeCompanyId { get; set; }
    public Guid? BikeModelId { get; set; }
    public Guid? ColorId { get; set; }
    public Guid? GraphicId { get; set; }
    public decimal MRP { get; set; }
    public string? HindiName { get; set; }
    public string? SearchKeywords { get; set; }
    public string? Barcode { get; set; }
    public string? QRCode { get; set; }
    public int MinimumStockQuantity { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public Shop Shop { get; set; } = null!;
    public Category? Category { get; set; }
    public Brand? Brand { get; set; }
    public BikeCompany? BikeCompany { get; set; }
    public BikeModel? BikeModel { get; set; }
    public Color? Color { get; set; }
    public Graphic? Graphic { get; set; }
    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<InventoryBatch> InventoryBatches { get; set; } = [];
}
