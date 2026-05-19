using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Dealers;

public interface IDealerService
{
    Task<Result<List<DealerResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<DealerResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<DealerResponse>> CreateAsync(CreateDealerRequest request, CancellationToken ct = default);
    Task<Result<DealerResponse>> UpdateAsync(Guid id, UpdateDealerRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
