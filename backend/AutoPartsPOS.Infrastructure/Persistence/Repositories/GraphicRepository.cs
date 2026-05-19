using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class GraphicRepository : IGraphicRepository
{
    private readonly AppDbContext _context;

    public GraphicRepository(AppDbContext context) => _context = context;

    public async Task<List<Graphic>> GetAllAsync(Guid shopId, CancellationToken ct = default) =>
        await _context.Graphics
            .Where(g => g.ShopId == shopId && g.IsActive)
            .OrderBy(g => g.Name)
            .ToListAsync(ct);

    public async Task<Graphic?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await _context.Graphics
            .FirstOrDefaultAsync(g => g.Id == id && g.ShopId == shopId, ct);

    public async Task AddAsync(Graphic graphic, CancellationToken ct = default) =>
        await _context.Graphics.AddAsync(graphic, ct);
}
