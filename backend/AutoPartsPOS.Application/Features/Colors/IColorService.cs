using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Colors;

public interface IColorService
{
    Task<Result<List<ColorResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<ColorResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<ColorResponse>> CreateAsync(CreateColorRequest request, CancellationToken ct = default);
    Task<Result<ColorResponse>> UpdateAsync(Guid id, UpdateColorRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
