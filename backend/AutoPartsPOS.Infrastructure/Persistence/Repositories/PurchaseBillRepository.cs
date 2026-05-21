using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class PurchaseBillRepository : IPurchaseBillRepository
{
    private readonly AppDbContext _context;

    public PurchaseBillRepository(AppDbContext context) => _context = context;

    public async Task<PurchaseBill?> GetByIdWithItemsAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await _context.PurchaseBills
            .Where(b => b.Id == id && b.ShopId == shopId)
            .Include(b => b.Dealer)
            .Include(b => b.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(ct);

    public async Task<PurchaseBillItem?> GetItemAsync(Guid purchaseBillId, Guid itemId, Guid shopId, CancellationToken ct = default) =>
        await _context.PurchaseBillItems
            .Where(i => i.Id == itemId && i.PurchaseBillId == purchaseBillId && i.ShopId == shopId)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(ct);

    public async Task<int> CountByShopAsync(Guid shopId, CancellationToken ct = default) =>
        await _context.PurchaseBills.CountAsync(x => x.ShopId == shopId, ct);

    public async Task AddAsync(PurchaseBill purchaseBill, CancellationToken ct = default) =>
        await _context.PurchaseBills.AddAsync(purchaseBill, ct);
}
