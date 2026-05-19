using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class BrandRepository : IBrandRepository
{
    private readonly AppDbContext _context;

    public BrandRepository(AppDbContext context) => _context = context;

    public async Task<List<Brand>> GetAllAsync(Guid shopId, CancellationToken ct = default) =>
        await _context.Brands
            .Where(b => b.ShopId == shopId && b.IsActive)
            .OrderBy(b => b.Name)
            .ToListAsync(ct);

    public async Task<Brand?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await _context.Brands
            .FirstOrDefaultAsync(b => b.Id == id && b.ShopId == shopId, ct);

    public async Task AddAsync(Brand brand, CancellationToken ct = default) =>
        await _context.Brands.AddAsync(brand, ct);
}
