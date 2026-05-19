namespace AutoPartsPOS.Domain.Entities;

public class SaleItem : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid SaleId { get; set; }
    public Guid ProductId { get; set; }
    public Guid InventoryBatchId { get; set; }
    public int Quantity { get; set; }
    public decimal MRP { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal PurchasePriceSnapshot { get; set; }
    public string PurchasePriceCodeSnapshot { get; set; } = string.Empty;
    public decimal ProfitAmount { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Sale Sale { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public InventoryBatch InventoryBatch { get; set; } = null!;
}
