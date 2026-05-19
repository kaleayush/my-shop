using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IShopRepository
{
    Task AddAsync(Shop shop, CancellationToken ct = default);
    Task<Shop?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<bool> ShopCodeExistsAsync(string code, CancellationToken ct = default);
}
