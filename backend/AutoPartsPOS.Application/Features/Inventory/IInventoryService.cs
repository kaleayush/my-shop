using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Inventory;

public interface IInventoryService
{
    Task<Result<List<InventoryBatchResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<List<InventoryBatchResponse>>> GetByProductAsync(Guid productId, CancellationToken ct = default);
    Task<Result<List<InventoryBatchResponse>>> GetLowStockAsync(CancellationToken ct = default);
    Task<Result<InventoryBatchResponse>> CreateBatchAsync(CreateInventoryBatchRequest request, CancellationToken ct = default);
    Task<Result<InventoryBatchResponse>> UpdateBatchAsync(Guid id, UpdateInventoryBatchRequest request, CancellationToken ct = default);
    Task<Result<InventoryBatchResponse>> AdjustAsync(AdjustInventoryRequest request, CancellationToken ct = default);
}
