using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class Sale : BaseEntity
{
    public Guid ShopId { get; set; }
    public string SaleNumber { get; set; } = string.Empty;
    public Guid DraftSaleId { get; set; }
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public decimal ProfitAmount { get; set; }
    public SalePaymentStatus PaymentStatus { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<SaleItem> Items { get; set; } = [];
    public ICollection<Payment> Payments { get; set; } = [];
}
