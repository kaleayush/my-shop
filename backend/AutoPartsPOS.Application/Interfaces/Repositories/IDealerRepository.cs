using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IDealerRepository
{
    Task<List<Dealer>> GetAllAsync(Guid shopId, CancellationToken ct = default);
    Task<Dealer?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task AddAsync(Dealer dealer, CancellationToken ct = default);
}
