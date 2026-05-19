using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<List<Category>> GetAllAsync(Guid shopId, CancellationToken ct = default);
    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(Category category, CancellationToken ct = default);
}
