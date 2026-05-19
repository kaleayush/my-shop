namespace AutoPartsPOS.Domain.Entities;

public class DraftSaleItem : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid DraftSaleId { get; set; }
    public Guid ProductId { get; set; }
    public Guid InventoryBatchId { get; set; }
    public int Quantity { get; set; }
    public decimal MRP { get; set; }
    public decimal SellingPrice { get; set; }
    public decimal PurchasePriceSnapshot { get; set; }
    public string PurchasePriceCodeSnapshot { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DraftSale DraftSale { get; set; } = null!;
    public Product Product { get; set; } = null!;
    public InventoryBatch InventoryBatch { get; set; } = null!;
}
