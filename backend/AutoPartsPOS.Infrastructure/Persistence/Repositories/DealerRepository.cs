using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class DealerRepository : IDealerRepository
{
    private readonly AppDbContext _context;

    public DealerRepository(AppDbContext context) => _context = context;

    public async Task<List<Dealer>> GetAllAsync(Guid shopId, CancellationToken ct = default) =>
        await _context.Dealers
            .Where(d => d.ShopId == shopId && d.IsActive)
            .OrderBy(d => d.Name)
            .ToListAsync(ct);

    public async Task<Dealer?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await _context.Dealers
            .FirstOrDefaultAsync(d => d.Id == id && d.ShopId == shopId, ct);

    public async Task AddAsync(Dealer dealer, CancellationToken ct = default) =>
        await _context.Dealers.AddAsync(dealer, ct);
}
