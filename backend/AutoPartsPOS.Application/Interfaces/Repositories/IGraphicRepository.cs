using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IGraphicRepository
{
    Task<List<Graphic>> GetAllAsync(Guid shopId, CancellationToken ct = default);
    Task<Graphic?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task AddAsync(Graphic graphic, CancellationToken ct = default);
}
