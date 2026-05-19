using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class DraftSale : AuditableEntity
{
    public Guid ShopId { get; set; }
    public string DraftNumber { get; set; } = string.Empty;
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public DraftSaleStatus Status { get; set; } = DraftSaleStatus.Draft;
    public decimal TotalAmount { get; set; }
    public Guid CreatedByUserId { get; set; }

    public User CreatedByUser { get; set; } = null!;
    public ICollection<DraftSaleItem> Items { get; set; } = [];
}
