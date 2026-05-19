using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IInventoryBatchRepository
{
    Task<List<InventoryBatch>> GetAllAsync(Guid shopId, CancellationToken ct = default);
    Task<List<InventoryBatch>> GetByProductAsync(Guid productId, Guid shopId, CancellationToken ct = default);
    Task<List<InventoryBatch>> GetLowStockAsync(Guid shopId, CancellationToken ct = default);
    Task<InventoryBatch?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task<int> CountByShopAsync(Guid shopId, CancellationToken ct = default);
    Task AddAsync(InventoryBatch batch, CancellationToken ct = default);
}
