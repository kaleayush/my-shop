using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.BikeCompanies;

public interface IBikeCompanyService
{
    Task<Result<List<BikeCompanyResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<BikeCompanyResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<BikeCompanyResponse>> CreateAsync(CreateBikeCompanyRequest request, CancellationToken ct = default);
    Task<Result<BikeCompanyResponse>> UpdateAsync(Guid id, UpdateBikeCompanyRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
