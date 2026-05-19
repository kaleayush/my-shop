namespace AutoPartsPOS.Domain.Entities;

public class DealerPayment : AuditableEntity
{
    public Guid ShopId { get; set; }
    public Guid DealerId { get; set; }
    public Guid? PurchaseBillId { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public string Status { get; set; } = "Pending";

    public Dealer Dealer { get; set; } = null!;
}
