using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class DraftSaleRepository : IDraftSaleRepository
{
    private readonly AppDbContext _context;

    public DraftSaleRepository(AppDbContext context) => _context = context;

    public async Task<List<DraftSale>> GetActiveAsync(Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId)
            .Where(x => x.Status == DraftSaleStatus.Draft || x.Status == DraftSaleStatus.Hold)
            .OrderByDescending(x => x.UpdatedAt)
            .ToListAsync(ct);

    public async Task<DraftSale?> GetByIdWithDetailsAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId).FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<int> CountByShopAsync(Guid shopId, CancellationToken ct = default) =>
        await _context.DraftSales.CountAsync(x => x.ShopId == shopId, ct);

    public async Task AddAsync(DraftSale draftSale, CancellationToken ct = default) =>
        await _context.DraftSales.AddAsync(draftSale, ct);

    public void RemoveItem(DraftSaleItem item) =>
        _context.DraftSaleItems.Remove(item);

    private IQueryable<DraftSale> BaseQuery(Guid shopId) =>
        _context.DraftSales
            .Where(x => x.ShopId == shopId)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .Include(x => x.Items)
                .ThenInclude(x => x.InventoryBatch)
                    .ThenInclude(x => x.Dealer);
}
