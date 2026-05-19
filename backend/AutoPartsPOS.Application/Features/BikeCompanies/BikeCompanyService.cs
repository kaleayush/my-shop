using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.BikeCompanies;

public class BikeCompanyService : IBikeCompanyService
{
    private readonly IBikeCompanyRepository _companies;
    private readonly IAppDbContext _context;

    public BikeCompanyService(IBikeCompanyRepository companies, IAppDbContext context)
    {
        _companies = companies;
        _context = context;
    }

    public async Task<Result<List<BikeCompanyResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _companies.GetAllAsync(ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<BikeCompanyResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var company = await _companies.GetByIdAsync(id, ct);
        if (company is null) return Result.Failure<BikeCompanyResponse>("Bike company not found.");
        return Result.Success(Map(company));
    }

    public async Task<Result<BikeCompanyResponse>> CreateAsync(CreateBikeCompanyRequest request, CancellationToken ct = default)
    {
        var company = new BikeCompany { Name = request.Name };
        await _companies.AddAsync(company, ct);
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(company));
    }

    public async Task<Result<BikeCompanyResponse>> UpdateAsync(Guid id, UpdateBikeCompanyRequest request, CancellationToken ct = default)
    {
        var company = await _companies.GetByIdAsync(id, ct);
        if (company is null) return Result.Failure<BikeCompanyResponse>("Bike company not found.");

        company.Name = request.Name;
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(company));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var company = await _companies.GetByIdAsync(id, ct);
        if (company is null) return Result.Failure("Bike company not found.");

        company.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static BikeCompanyResponse Map(BikeCompany c) => new(c.Id, c.Name, c.IsActive);
}
