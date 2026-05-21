using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IPurchaseBillRepository
{
    Task<PurchaseBill?> GetByIdWithItemsAsync(Guid id, Guid shopId, CancellationToken ct = default);
    Task<PurchaseBillItem?> GetItemAsync(Guid purchaseBillId, Guid itemId, Guid shopId, CancellationToken ct = default);
    Task<int> CountByShopAsync(Guid shopId, CancellationToken ct = default);
    Task AddAsync(PurchaseBill purchaseBill, CancellationToken ct = default);
}
