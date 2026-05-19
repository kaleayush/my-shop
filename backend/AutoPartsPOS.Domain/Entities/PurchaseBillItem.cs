namespace AutoPartsPOS.Domain.Entities;

public class PurchaseBillItem : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid PurchaseBillId { get; set; }
    public Guid? ProductId { get; set; }
    public string RawProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal MRP { get; set; }
    public decimal PurchasePrice { get; set; }
    public Guid? SuggestedProductId { get; set; }
    public decimal MatchConfidence { get; set; }
    public bool IsConfirmed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public PurchaseBill PurchaseBill { get; set; } = null!;
    public Product? Product { get; set; }
}
