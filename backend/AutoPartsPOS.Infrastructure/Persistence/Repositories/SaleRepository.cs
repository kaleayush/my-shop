using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly AppDbContext _context;

    public SaleRepository(AppDbContext context) => _context = context;

    public async Task<Sale?> GetByIdWithDetailsAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId).FirstOrDefaultAsync(x => x.Id == id, ct);

    public async Task<int> CountByShopAsync(Guid shopId, int year, CancellationToken ct = default) =>
        await _context.Sales.CountAsync(x => x.ShopId == shopId && x.CreatedAt.Year == year, ct);

    public async Task AddAsync(Sale sale, CancellationToken ct = default) =>
        await _context.Sales.AddAsync(sale, ct);

    private IQueryable<Sale> BaseQuery(Guid shopId) =>
        _context.Sales
            .Where(x => x.ShopId == shopId)
            .Include(x => x.Items)
                .ThenInclude(x => x.Product)
            .Include(x => x.Items)
                .ThenInclude(x => x.InventoryBatch)
                    .ThenInclude(x => x.Dealer)
            .Include(x => x.Payments);
}
