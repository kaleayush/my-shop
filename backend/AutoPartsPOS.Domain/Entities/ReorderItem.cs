using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class ReorderItem : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid DealerId { get; set; }
    public Guid ProductId { get; set; }
    public Guid? InventoryBatchId { get; set; }
    public int CurrentQuantity { get; set; }
    public int MinimumQuantity { get; set; }
    public int RequiredQuantity { get; set; }
    public ReorderStatus Status { get; set; } = ReorderStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
