using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class Return : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid SaleId { get; set; }
    public Guid SaleItemId { get; set; }
    public Guid ProductId { get; set; }
    public Guid InventoryBatchId { get; set; }
    public int Quantity { get; set; }
    public ReturnType ReturnType { get; set; }
    public string? Reason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
