using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Brands;

public interface IBrandService
{
    Task<Result<List<BrandResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<BrandResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<BrandResponse>> CreateAsync(CreateBrandRequest request, CancellationToken ct = default);
    Task<Result<BrandResponse>> UpdateAsync(Guid id, UpdateBrandRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
