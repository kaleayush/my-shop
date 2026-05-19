using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.Brands;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _brands;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public BrandService(IBrandRepository brands, ICurrentUserService currentUser, IAppDbContext context)
    {
        _brands = brands;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<BrandResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _brands.GetAllAsync(_currentUser.ShopId, ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<BrandResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var brand = await _brands.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (brand is null) return Result.Failure<BrandResponse>("Brand not found.");
        return Result.Success(Map(brand));
    }

    public async Task<Result<BrandResponse>> CreateAsync(CreateBrandRequest request, CancellationToken ct = default)
    {
        var brand = new Brand
        {
            ShopId = _currentUser.ShopId,
            Name = request.Name,
        };

        await _brands.AddAsync(brand, ct);
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(brand));
    }

    public async Task<Result<BrandResponse>> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken ct = default)
    {
        var brand = await _brands.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (brand is null) return Result.Failure<BrandResponse>("Brand not found.");

        brand.Name = request.Name;
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(brand));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var brand = await _brands.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (brand is null) return Result.Failure("Brand not found.");

        brand.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static BrandResponse Map(Brand b) => new(b.Id, b.Name, b.IsActive);
}
