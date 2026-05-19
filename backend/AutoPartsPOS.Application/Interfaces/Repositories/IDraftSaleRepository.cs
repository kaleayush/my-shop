using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IDraftSaleRepository
{
    Task<List<DraftSale>> GetActiveAsync(Guid shopId, CancellationToken ct = default);
    Task<DraftSale?> GetByIdWithDetailsAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task<int> CountByShopAsync(Guid shopId, CancellationToken ct = default);
    Task AddAsync(DraftSale draftSale, CancellationToken ct = default);
    void RemoveItem(DraftSaleItem item);
}
