using AutoPartsPOS.Application.Common;

namespace AutoPartsPOS.Application.Features.Graphics;

public interface IGraphicService
{
    Task<Result<List<GraphicResponse>>> GetAllAsync(CancellationToken ct = default);
    Task<Result<GraphicResponse>> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Result<GraphicResponse>> CreateAsync(CreateGraphicRequest request, CancellationToken ct = default);
    Task<Result<GraphicResponse>> UpdateAsync(Guid id, UpdateGraphicRequest request, CancellationToken ct = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken ct = default);
}
