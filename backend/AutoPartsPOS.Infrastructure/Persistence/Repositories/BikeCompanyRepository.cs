using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class BikeCompanyRepository : IBikeCompanyRepository
{
    private readonly AppDbContext _context;

    public BikeCompanyRepository(AppDbContext context) => _context = context;

    public async Task<List<BikeCompany>> GetAllAsync(CancellationToken ct = default) =>
        await _context.BikeCompanies
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .ToListAsync(ct);

    public async Task<BikeCompany?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _context.BikeCompanies.FirstOrDefaultAsync(c => c.Id == id, ct);

    public async Task AddAsync(BikeCompany company, CancellationToken ct = default) =>
        await _context.BikeCompanies.AddAsync(company, ct);
}
