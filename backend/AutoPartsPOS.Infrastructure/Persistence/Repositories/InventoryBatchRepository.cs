using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class InventoryBatchRepository : IInventoryBatchRepository
{
    private readonly IAppDbContext _context;

    public InventoryBatchRepository(IAppDbContext context) => _context = context;

    public async Task<List<InventoryBatch>> GetAllAsync(Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId)
            .Where(b => b.IsActive)
            .OrderBy(b => b.Product.ProductName)
            .ThenBy(b => b.Dealer.Name)
            .ThenBy(b => b.BatchNumber)
            .ToListAsync(ct);

    public async Task<List<InventoryBatch>> GetByProductAsync(Guid productId, Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId)
            .Where(b => b.ProductId == productId && b.IsActive)
            .OrderBy(b => b.Dealer.Name)
            .ThenBy(b => b.BatchNumber)
            .ToListAsync(ct);

    public async Task<List<InventoryBatch>> GetLowStockAsync(Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId)
            .Where(b => b.IsActive && b.CurrentQuantity - b.ReservedQuantity <= b.MinimumStockQuantity)
            .OrderBy(b => b.Dealer.Name)
            .ThenBy(b => b.Product.ProductName)
            .ToListAsync(ct);

    public async Task<InventoryBatch?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId).FirstOrDefaultAsync(b => b.Id == id, ct);

    public async Task AddAsync(InventoryBatch batch, CancellationToken ct = default) =>
        await _context.InventoryBatches.AddAsync(batch, ct);

    private IQueryable<InventoryBatch> BaseQuery(Guid shopId) =>
        _context.InventoryBatches
            .Where(b => b.ShopId == shopId)
            .Include(b => b.Product)
            .Include(b => b.Dealer);
}
