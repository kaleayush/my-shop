namespace AutoPartsPOS.Domain.Entities;

public class InventoryBatch : AuditableEntity
{
    public Guid ShopId { get; set; }
    public Guid ProductId { get; set; }
    public Guid DealerId { get; set; }
    public Guid? PurchaseBillId { get; set; }
    public Guid? PurchaseBillItemId { get; set; }
    public string BatchNumber { get; set; } = string.Empty;
    public decimal MRP { get; set; }
    public decimal PurchasePrice { get; set; }
    public string PurchasePriceCode { get; set; } = string.Empty;
    public int InitialQuantity { get; set; }
    public int CurrentQuantity { get; set; }
    public int ReservedQuantity { get; set; }
    public int SoldQuantity { get; set; }
    public int DamagedQuantity { get; set; }
    public int MinimumStockQuantity { get; set; }
    public DateTime PurchaseDate { get; set; }
    public bool IsActive { get; set; } = true;

    public int AvailableQuantity => CurrentQuantity - ReservedQuantity;

    public Product Product { get; set; } = null!;
    public Dealer Dealer { get; set; } = null!;
}
