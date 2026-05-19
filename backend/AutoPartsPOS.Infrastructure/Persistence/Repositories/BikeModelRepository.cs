using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class BikeModelRepository : IBikeModelRepository
{
    private readonly IAppDbContext _context;

    public BikeModelRepository(IAppDbContext context) => _context = context;

    public async Task<List<BikeModel>> GetAllAsync(CancellationToken ct = default) =>
        await _context.BikeModels
            .Include(m => m.BikeCompany)
            .Where(m => m.IsActive)
            .OrderBy(m => m.BikeCompany.Name).ThenBy(m => m.Name)
            .ToListAsync(ct);

    public async Task<List<BikeModel>> GetByCompanyAsync(Guid bikeCompanyId, CancellationToken ct = default) =>
        await _context.BikeModels
            .Include(m => m.BikeCompany)
            .Where(m => m.BikeCompanyId == bikeCompanyId && m.IsActive)
            .OrderBy(m => m.Name)
            .ToListAsync(ct);

    public async Task<BikeModel?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.BikeModels
            .Include(m => m.BikeCompany)
            .FirstOrDefaultAsync(m => m.Id == id, ct);

    public async Task AddAsync(BikeModel model, CancellationToken ct = default) =>
        await _context.BikeModels.AddAsync(model, ct);
}
