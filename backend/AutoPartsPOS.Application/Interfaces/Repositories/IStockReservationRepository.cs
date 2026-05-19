using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IStockReservationRepository
{
    Task<StockReservation?> GetActiveByDraftSaleItemAsync(Guid draftSaleItemId, Guid shopId, CancellationToken ct = default);
    Task<List<StockReservation>> GetActiveByDraftSaleAsync(Guid draftSaleId, Guid shopId, CancellationToken ct = default);
    Task AddAsync(StockReservation reservation, CancellationToken ct = default);
}
