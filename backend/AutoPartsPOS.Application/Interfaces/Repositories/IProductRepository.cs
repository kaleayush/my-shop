using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<List<Product>> SearchAsync(Guid shopId, string? query, Guid? categoryId, Guid? dealerId, bool includeInactive, CancellationToken ct = default);
    Task<Product?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task<Product?> GetByIdWithDetailsAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task AddAsync(Product product, CancellationToken ct = default);
}
