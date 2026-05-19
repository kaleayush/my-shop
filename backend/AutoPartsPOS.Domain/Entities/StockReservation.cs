using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class StockReservation : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid DraftSaleId { get; set; }
    public Guid DraftSaleItemId { get; set; }
    public Guid InventoryBatchId { get; set; }
    public int Quantity { get; set; }
    public StockReservationStatus Status { get; set; } = StockReservationStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReleasedAt { get; set; }

    public InventoryBatch InventoryBatch { get; set; } = null!;
}
