using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IBrandRepository
{
    Task<List<Brand>> GetAllAsync(Guid shopId, CancellationToken ct = default);
    Task<Brand?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task AddAsync(Brand brand, CancellationToken ct = default);
}
