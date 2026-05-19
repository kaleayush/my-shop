using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class DamagedStock : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid ProductId { get; set; }
    public Guid InventoryBatchId { get; set; }
    public int Quantity { get; set; }
    public string? Reason { get; set; }
    public DamagedStockStatus Status { get; set; } = DamagedStockStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
