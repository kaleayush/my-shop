using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class Payment : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid? SaleId { get; set; }
    public Guid? DealerId { get; set; }
    public PaymentType PaymentType { get; set; }
    public decimal Amount { get; set; }
    public PaymentMode PaymentMode { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
