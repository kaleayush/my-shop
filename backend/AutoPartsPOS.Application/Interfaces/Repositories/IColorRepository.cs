using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IColorRepository
{
    Task<List<Color>> GetAllAsync(Guid shopId, CancellationToken ct = default);
    Task<Color?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task AddAsync(Color color, CancellationToken ct = default);
}
