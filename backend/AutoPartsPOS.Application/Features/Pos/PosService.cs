using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Application.Features.Pos;

public class PosService : IPosService
{
    private readonly IDraftSaleRepository _drafts;
    private readonly IInventoryBatchRepository _batches;
    private readonly IStockReservationRepository _reservations;
    private readonly ISaleRepository _sales;
    private readonly IShopRepository _shops;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public PosService(
        IDraftSaleRepository drafts,
        IInventoryBatchRepository batches,
        IStockReservationRepository reservations,
        ISaleRepository sales,
        IShopRepository shops,
        ICurrentUserService currentUser,
        IAppDbContext context)
    {
        _drafts = drafts;
        _batches = batches;
        _reservations = reservations;
        _sales = sales;
        _shops = shops;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<DraftSaleResponse>> CreateDraftAsync(CreateDraftSaleRequest request, CancellationToken ct = default)
    {
        var draft = new DraftSale
        {
            ShopId = _currentUser.ShopId,
            DraftNumber = await GenerateDraftNumberAsync(ct),
            CustomerName = TrimOrNull(request.CustomerName),
            CustomerPhone = TrimOrNull(request.CustomerPhone),
            Status = DraftSaleStatus.Draft,
            TotalAmount = 0,
            CreatedByUserId = _currentUser.UserId
        };

        await _drafts.AddAsync(draft, ct);
        await _context.SaveChangesAsync(ct);

        var created = await _drafts.GetByIdWithDetailsAsync(draft.Id, _currentUser.ShopId, ct);
        return Result.Success(MapDraft(created!));
    }

    public async Task<Result<List<DraftSaleResponse>>> GetActiveDraftsAsync(CancellationToken ct = default)
    {
        var drafts = await _drafts.GetActiveAsync(_currentUser.ShopId, ct);
        return Result.Success(drafts.Select(MapDraft).ToList());
    }

    public async Task<Result<DraftSaleResponse>> GetDraftAsync(Guid draftSaleId, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<DraftSaleResponse>("Draft sale not found.");
        return Result.Success(MapDraft(draft));
    }

    public async Task<Result<DraftSaleResponse>> AddItemAsync(Guid draftSaleId, AddDraftSaleItemRequest request, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<DraftSaleResponse>("Draft sale not found.");
        if (!CanEdit(draft)) return Result.Failure<DraftSaleResponse>("Draft sale cannot be edited.");

        var batch = await _batches.GetByIdAsync(request.InventoryBatchId, _currentUser.ShopId, ct);
        if (batch is null || !batch.IsActive) return Result.Failure<DraftSaleResponse>("Inventory batch not found.");
        if (batch.ProductId != request.ProductId) return Result.Failure<DraftSaleResponse>("Selected batch does not belong to the product.");
        if (batch.AvailableQuantity < request.Quantity) return Result.Failure<DraftSaleResponse>("Not enough available stock in selected batch.");

        var existing = draft.Items.FirstOrDefault(x => x.InventoryBatchId == request.InventoryBatchId);
        if (existing is not null)
        {
            var newQuantity = existing.Quantity + request.Quantity;
            if (batch.AvailableQuantity + existing.Quantity < newQuantity)
                return Result.Failure<DraftSaleResponse>("Not enough available stock in selected batch.");

            existing.Quantity = newQuantity;
            existing.SellingPrice = request.SellingPrice;

            var reservation = await _reservations.GetActiveByDraftSaleItemAsync(existing.Id, _currentUser.ShopId, ct);
            if (reservation is null) return Result.Failure<DraftSaleResponse>("Stock reservation not found.");
            reservation.Quantity = newQuantity;
        }
        else
        {
            var item = new DraftSaleItem
            {
                ShopId = _currentUser.ShopId,
                DraftSaleId = draft.Id,
                ProductId = request.ProductId,
                InventoryBatchId = request.InventoryBatchId,
                Quantity = request.Quantity,
                MRP = batch.MRP,
                SellingPrice = request.SellingPrice,
                PurchasePriceSnapshot = batch.PurchasePrice,
                PurchasePriceCodeSnapshot = batch.PurchasePriceCode
            };

            draft.Items.Add(item);

            await _reservations.AddAsync(new StockReservation
            {
                ShopId = _currentUser.ShopId,
                DraftSaleId = draft.Id,
                DraftSaleItemId = item.Id,
                InventoryBatchId = batch.Id,
                Quantity = request.Quantity,
                Status = StockReservationStatus.Active
            }, ct);
        }

        batch.ReservedQuantity += request.Quantity;
        draft.Status = DraftSaleStatus.Draft;
        RecalculateTotal(draft);

        await _context.SaveChangesAsync(ct);
        var updated = await _drafts.GetByIdWithDetailsAsync(draft.Id, _currentUser.ShopId, ct);
        return Result.Success(MapDraft(updated!));
    }

    public async Task<Result<DraftSaleResponse>> UpdateItemAsync(Guid draftSaleId, Guid itemId, UpdateDraftSaleItemRequest request, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<DraftSaleResponse>("Draft sale not found.");
        if (!CanEdit(draft)) return Result.Failure<DraftSaleResponse>("Draft sale cannot be edited.");

        var item = draft.Items.FirstOrDefault(x => x.Id == itemId);
        if (item is null) return Result.Failure<DraftSaleResponse>("Draft sale item not found.");

        var batch = await _batches.GetByIdAsync(item.InventoryBatchId, _currentUser.ShopId, ct);
        if (batch is null) return Result.Failure<DraftSaleResponse>("Inventory batch not found.");

        var availableForItem = batch.AvailableQuantity + item.Quantity;
        if (availableForItem < request.Quantity) return Result.Failure<DraftSaleResponse>("Not enough available stock in selected batch.");

        var reservation = await _reservations.GetActiveByDraftSaleItemAsync(item.Id, _currentUser.ShopId, ct);
        if (reservation is null) return Result.Failure<DraftSaleResponse>("Stock reservation not found.");

        var delta = request.Quantity - item.Quantity;
        batch.ReservedQuantity += delta;
        item.Quantity = request.Quantity;
        item.SellingPrice = request.SellingPrice;
        reservation.Quantity = request.Quantity;
        draft.Status = DraftSaleStatus.Draft;
        RecalculateTotal(draft);

        await _context.SaveChangesAsync(ct);
        var updated = await _drafts.GetByIdWithDetailsAsync(draft.Id, _currentUser.ShopId, ct);
        return Result.Success(MapDraft(updated!));
    }

    public async Task<Result<DraftSaleResponse>> RemoveItemAsync(Guid draftSaleId, Guid itemId, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<DraftSaleResponse>("Draft sale not found.");
        if (!CanEdit(draft)) return Result.Failure<DraftSaleResponse>("Draft sale cannot be edited.");

        var item = draft.Items.FirstOrDefault(x => x.Id == itemId);
        if (item is null) return Result.Failure<DraftSaleResponse>("Draft sale item not found.");

        var batch = await _batches.GetByIdAsync(item.InventoryBatchId, _currentUser.ShopId, ct);
        if (batch is null) return Result.Failure<DraftSaleResponse>("Inventory batch not found.");

        var reservation = await _reservations.GetActiveByDraftSaleItemAsync(item.Id, _currentUser.ShopId, ct);
        if (reservation is not null)
        {
            reservation.Status = StockReservationStatus.Released;
            reservation.ReleasedAt = DateTime.UtcNow;
        }

        batch.ReservedQuantity = Math.Max(0, batch.ReservedQuantity - item.Quantity);
        draft.Items.Remove(item);
        _drafts.RemoveItem(item);
        RecalculateTotal(draft);

        await _context.SaveChangesAsync(ct);
        var updated = await _drafts.GetByIdWithDetailsAsync(draft.Id, _currentUser.ShopId, ct);
        return Result.Success(MapDraft(updated!));
    }

    public async Task<Result<DraftSaleResponse>> HoldAsync(Guid draftSaleId, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<DraftSaleResponse>("Draft sale not found.");
        if (draft.Status != DraftSaleStatus.Draft) return Result.Failure<DraftSaleResponse>("Only draft bills can be held.");

        draft.Status = DraftSaleStatus.Hold;
        await _context.SaveChangesAsync(ct);
        return Result.Success(MapDraft(draft));
    }

    public async Task<Result<DraftSaleResponse>> CancelAsync(Guid draftSaleId, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<DraftSaleResponse>("Draft sale not found.");
        if (!CanEdit(draft)) return Result.Failure<DraftSaleResponse>("Draft sale cannot be cancelled.");

        var reservations = await _reservations.GetActiveByDraftSaleAsync(draft.Id, _currentUser.ShopId, ct);
        foreach (var reservation in reservations)
        {
            var batch = draft.Items.FirstOrDefault(x => x.Id == reservation.DraftSaleItemId)?.InventoryBatch
                ?? await _batches.GetByIdAsync(reservation.InventoryBatchId, _currentUser.ShopId, ct);

            if (batch is not null)
                batch.ReservedQuantity = Math.Max(0, batch.ReservedQuantity - reservation.Quantity);

            reservation.Status = StockReservationStatus.Released;
            reservation.ReleasedAt = DateTime.UtcNow;
        }

        draft.Status = DraftSaleStatus.Cancelled;
        await _context.SaveChangesAsync(ct);
        return Result.Success(MapDraft(draft));
    }

    public async Task<Result<SaleResponse>> CompleteAsync(Guid draftSaleId, CompleteDraftSaleRequest request, CancellationToken ct = default)
    {
        var draft = await _drafts.GetByIdWithDetailsAsync(draftSaleId, _currentUser.ShopId, ct);
        if (draft is null) return Result.Failure<SaleResponse>("Draft sale not found.");
        if (!CanEdit(draft)) return Result.Failure<SaleResponse>("Draft sale cannot be completed.");
        if (draft.Items.Count == 0) return Result.Failure<SaleResponse>("Cannot complete an empty draft bill.");

        RecalculateTotal(draft);
        if (request.PaidAmount > draft.TotalAmount) return Result.Failure<SaleResponse>("Paid amount cannot exceed total amount.");

        var sale = new Sale
        {
            ShopId = _currentUser.ShopId,
            SaleNumber = await GenerateSaleNumberAsync(ct),
            DraftSaleId = draft.Id,
            CustomerName = TrimOrNull(request.CustomerName) ?? draft.CustomerName,
            CustomerPhone = TrimOrNull(request.CustomerPhone) ?? draft.CustomerPhone,
            TotalAmount = draft.TotalAmount,
            PaidAmount = request.PaidAmount,
            PendingAmount = draft.TotalAmount - request.PaidAmount,
            CreatedByUserId = _currentUser.UserId,
            PaymentStatus = ResolvePaymentStatus(draft.TotalAmount, request.PaidAmount)
        };

        foreach (var draftItem in draft.Items)
        {
            if (draftItem.InventoryBatch.CurrentQuantity < draftItem.Quantity ||
                draftItem.InventoryBatch.ReservedQuantity < draftItem.Quantity)
            {
                return Result.Failure<SaleResponse>($"Stock changed for {draftItem.Product.ProductName}. Please review the draft.");
            }

            var profit = (draftItem.SellingPrice - draftItem.PurchasePriceSnapshot) * draftItem.Quantity;
            sale.ProfitAmount += profit;
            sale.Items.Add(new SaleItem
            {
                ShopId = _currentUser.ShopId,
                SaleId = sale.Id,
                ProductId = draftItem.ProductId,
                InventoryBatchId = draftItem.InventoryBatchId,
                Quantity = draftItem.Quantity,
                MRP = draftItem.MRP,
                SellingPrice = draftItem.SellingPrice,
                PurchasePriceSnapshot = draftItem.PurchasePriceSnapshot,
                PurchasePriceCodeSnapshot = draftItem.PurchasePriceCodeSnapshot,
                ProfitAmount = profit
            });

            draftItem.InventoryBatch.ReservedQuantity -= draftItem.Quantity;
            draftItem.InventoryBatch.CurrentQuantity -= draftItem.Quantity;
            draftItem.InventoryBatch.SoldQuantity += draftItem.Quantity;
        }

        if (request.PaidAmount > 0)
        {
            sale.Payments.Add(new Payment
            {
                ShopId = _currentUser.ShopId,
                SaleId = sale.Id,
                PaymentType = PaymentType.CustomerPayment,
                Amount = request.PaidAmount,
                PaymentMode = request.PaymentMode,
                Notes = TrimOrNull(request.Notes)
            });
        }

        var reservations = await _reservations.GetActiveByDraftSaleAsync(draft.Id, _currentUser.ShopId, ct);
        foreach (var reservation in reservations)
        {
            reservation.Status = StockReservationStatus.ConvertedToSale;
            reservation.ReleasedAt = DateTime.UtcNow;
        }

        draft.Status = DraftSaleStatus.Completed;
        draft.CustomerName = sale.CustomerName;
        draft.CustomerPhone = sale.CustomerPhone;

        await _sales.AddAsync(sale, ct);
        await _context.SaveChangesAsync(ct);

        var created = await _sales.GetByIdWithDetailsAsync(sale.Id, _currentUser.ShopId, ct);
        return Result.Success(MapSale(created!));
    }

    public async Task<Result<SaleResponse>> GetSaleAsync(Guid saleId, CancellationToken ct = default)
    {
        var sale = await _sales.GetByIdWithDetailsAsync(saleId, _currentUser.ShopId, ct);
        if (sale is null) return Result.Failure<SaleResponse>("Sale not found.");
        return Result.Success(MapSale(sale));
    }

    private async Task<string> GenerateDraftNumberAsync(CancellationToken ct)
    {
        var count = await _drafts.CountByShopAsync(_currentUser.ShopId, ct);
        return $"DRAFT-{DateTime.UtcNow:yyyyMMdd}-{count + 1:0000}";
    }

    private async Task<string> GenerateSaleNumberAsync(CancellationToken ct)
    {
        var shop = await _shops.GetByIdAsync(_currentUser.ShopId, ct);
        var count = await _sales.CountByShopAsync(_currentUser.ShopId, DateTime.UtcNow.Year, ct);
        var prefix = shop?.ShopCode ?? "SHOP";
        return $"{prefix}-{DateTime.UtcNow:yyyy}-{count + 1:0000}";
    }

    private static bool CanEdit(DraftSale draft) =>
        draft.Status is DraftSaleStatus.Draft or DraftSaleStatus.Hold;

    private static SalePaymentStatus ResolvePaymentStatus(decimal total, decimal paid)
    {
        if (paid >= total) return SalePaymentStatus.Paid;
        return paid <= 0 ? SalePaymentStatus.Pending : SalePaymentStatus.Partial;
    }

    private static void RecalculateTotal(DraftSale draft) =>
        draft.TotalAmount = draft.Items.Sum(x => x.Quantity * x.SellingPrice);

    private static string? TrimOrNull(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private DraftSaleResponse MapDraft(DraftSale draft) =>
        new(
            draft.Id,
            draft.DraftNumber,
            draft.CustomerName,
            draft.CustomerPhone,
            draft.Status,
            draft.TotalAmount,
            draft.CreatedAt,
            draft.UpdatedAt,
            draft.Items.OrderBy(x => x.CreatedAt).Select(MapDraftItem).ToList());

    private DraftSaleItemResponse MapDraftItem(DraftSaleItem item) =>
        new(
            item.Id,
            item.ProductId,
            item.Product.ProductName,
            item.InventoryBatchId,
            item.InventoryBatch.DealerId,
            item.InventoryBatch.Dealer.Name,
            item.InventoryBatch.BatchNumber,
            item.Quantity,
            item.MRP,
            item.SellingPrice,
            item.Quantity * item.SellingPrice,
            _currentUser.IsOwner ? item.PurchasePriceSnapshot : null,
            item.PurchasePriceCodeSnapshot);

    private SaleResponse MapSale(Sale sale) =>
        new(
            sale.Id,
            sale.SaleNumber,
            sale.DraftSaleId,
            sale.CustomerName,
            sale.CustomerPhone,
            sale.TotalAmount,
            sale.PaidAmount,
            sale.PendingAmount,
            _currentUser.IsOwner ? sale.ProfitAmount : null,
            sale.PaymentStatus,
            sale.CreatedAt,
            sale.Items.OrderBy(x => x.CreatedAt).Select(MapSaleItem).ToList(),
            sale.Payments.OrderBy(x => x.CreatedAt).Select(MapPayment).ToList());

    private SaleItemResponse MapSaleItem(SaleItem item) =>
        new(
            item.Id,
            item.ProductId,
            item.Product.ProductName,
            item.InventoryBatchId,
            item.InventoryBatch.Dealer.Name,
            item.InventoryBatch.BatchNumber,
            item.Quantity,
            item.MRP,
            item.SellingPrice,
            item.Quantity * item.SellingPrice,
            _currentUser.IsOwner ? item.PurchasePriceSnapshot : null,
            item.PurchasePriceCodeSnapshot,
            _currentUser.IsOwner ? item.ProfitAmount : null);

    private static PaymentResponse MapPayment(Payment payment) =>
        new(
            payment.Id,
            payment.Amount,
            payment.PaymentMode,
            payment.Notes,
            payment.CreatedAt);
}
