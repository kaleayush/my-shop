using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class PurchaseBill : AuditableEntity
{
    public Guid ShopId { get; set; }
    public Guid DealerId { get; set; }
    public string BillNumber { get; set; } = string.Empty;
    public DateTime BillDate { get; set; }
    public string? UploadedFileUrl { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public PurchaseBillStatus Status { get; set; } = PurchaseBillStatus.Uploaded;

    public Dealer Dealer { get; set; } = null!;
    public ICollection<PurchaseBillItem> Items { get; set; } = [];
}
