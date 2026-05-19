using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class ColorRepository : IColorRepository
{
    private readonly AppDbContext _context;

    public ColorRepository(AppDbContext context) => _context = context;

    public async Task<List<Color>> GetAllAsync(Guid shopId, CancellationToken ct = default) =>
        await _context.Colors
            .Where(c => c.ShopId == shopId && c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<Color?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await _context.Colors
            .FirstOrDefaultAsync(c => c.Id == id && c.ShopId == shopId, ct);

    public async Task AddAsync(Color color, CancellationToken ct = default) =>
        await _context.Colors.AddAsync(color, ct);
}
