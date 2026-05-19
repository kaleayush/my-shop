using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.BikeModels;

public interface IBikeModelService
{
    Task<Result<List<BikeModelResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<List<BikeModelResponse>>> GetByCompanyAsync(Guid bikeCompanyId, CancellationToken ct = default);
    Task<Result<BikeModelResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<BikeModelResponse>> CreateAsync(CreateBikeModelRequest request, CancellationToken ct = default);
    Task<Result<BikeModelResponse>> UpdateAsync(Guid id, UpdateBikeModelRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
