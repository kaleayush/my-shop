using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface ISaleRepository
{
    Task<Sale?> GetByIdWithDetailsAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task<int> CountByShopAsync(Guid shopId, int year, CancellationToken ct = default);
    Task AddAsync(Sale sale, CancellationToken ct = default);
}
