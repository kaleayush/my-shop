using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class StockReservationRepository : IStockReservationRepository
{
    private readonly AppDbContext _context;

    public StockReservationRepository(AppDbContext context) => _context = context;

    public async Task<StockReservation?> GetActiveByDraftSaleItemAsync(Guid draftSaleItemId, Guid shopId, CancellationToken ct = default) =>
        await _context.StockReservations.FirstOrDefaultAsync(x =>
            x.ShopId == shopId &&
            x.DraftSaleItemId == draftSaleItemId &&
            x.Status == StockReservationStatus.Active, ct);

    public async Task<List<StockReservation>> GetActiveByDraftSaleAsync(Guid draftSaleId, Guid shopId, CancellationToken ct = default) =>
        await _context.StockReservations
            .Where(x =>
                x.ShopId == shopId &&
                x.DraftSaleId == draftSaleId &&
                x.Status == StockReservationStatus.Active)
            .ToListAsync(ct);

    public async Task AddAsync(StockReservation reservation, CancellationToken ct = default) =>
        await _context.StockReservations.AddAsync(reservation, ct);
}
