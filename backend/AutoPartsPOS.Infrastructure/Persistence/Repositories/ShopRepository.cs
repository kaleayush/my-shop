using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class ShopRepository : IShopRepository
{
    private readonly IAppDbContext _context;

    public ShopRepository(IAppDbContext context) => _context = context;

    public async Task AddAsync(Shop shop, CancellationToken ct = default) =>
        await _context.Shops.AddAsync(shop, ct);

    public async Task<Shop?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.Shops.FirstOrDefaultAsync(s => s.Id == id, ct);

    public async Task<bool> ShopCodeExistsAsync(string code, CancellationToken ct = default) =>
        await _context.Shops.AnyAsync(s => s.ShopCode == code, ct);
}
