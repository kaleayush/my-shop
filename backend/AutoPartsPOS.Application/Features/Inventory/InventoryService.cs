using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Application.Features.Inventory;

public class InventoryService : IInventoryService
{
    private readonly IInventoryBatchRepository _batches;
    private readonly IPurchasePriceCodeService _priceCode;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public InventoryService(
        IInventoryBatchRepository batches,
        IPurchasePriceCodeService priceCode,
        ICurrentUserService currentUser,
        IAppDbContext context)
    {
        _batches = batches;
        _priceCode = priceCode;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<InventoryBatchResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var batches = await _batches.GetAllAsync(_currentUser.ShopId, ct);
        return Result.Success(batches.Select(Map).ToList());
    }

    public async Task<Result<List<InventoryBatchResponse>>> GetByProductAsync(Guid productId, CancellationToken ct = default)
    {
        var productExists = await _context.Products.AnyAsync(p => p.Id == productId && p.ShopId == _currentUser.ShopId, ct);
        if (!productExists) return Result.Failure<List<InventoryBatchResponse>>("Product not found.");

        var batches = await _batches.GetByProductAsync(productId, _currentUser.ShopId, ct);
        return Result.Success(batches.Select(Map).ToList());
    }

    public async Task<Result<List<InventoryBatchResponse>>> GetLowStockAsync(CancellationToken ct = default)
    {
        var batches = await _batches.GetLowStockAsync(_currentUser.ShopId, ct);
        return Result.Success(batches.Select(Map).ToList());
    }

    public async Task<Result<InventoryBatchResponse>> CreateBatchAsync(CreateInventoryBatchRequest request, CancellationToken ct = default)
    {
        var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == request.ProductId && p.ShopId == _currentUser.ShopId && p.IsActive, ct);
        if (product is null) return Result.Failure<InventoryBatchResponse>("Product not found.");

        var dealerExists = await _context.Dealers.AnyAsync(d => d.Id == request.DealerId && d.ShopId == _currentUser.ShopId && d.IsActive, ct);
        if (!dealerExists) return Result.Failure<InventoryBatchResponse>("Dealer not found.");

        var batch = new InventoryBatch
        {
            ShopId = _currentUser.ShopId,
            ProductId = request.ProductId,
            DealerId = request.DealerId,
            BatchNumber = string.IsNullOrWhiteSpace(request.BatchNumber)
                ? await GenerateBatchNumberAsync(ct)
                : request.BatchNumber.Trim(),
            MRP = request.MRP,
            PurchasePrice = request.PurchasePrice,
            PurchasePriceCode = _priceCode.Encode(request.PurchasePrice),
            InitialQuantity = request.Quantity,
            CurrentQuantity = request.Quantity,
            ReservedQuantity = 0,
            SoldQuantity = 0,
            DamagedQuantity = 0,
            MinimumStockQuantity = request.MinimumStockQuantity,
            PurchaseDate = NormalizeDate(request.PurchaseDate),
            IsActive = true,
        };

        await _batches.AddAsync(batch, ct);
        await _context.SaveChangesAsync(ct);

        var created = await _batches.GetByIdAsync(batch.Id, _currentUser.ShopId, ct);
        return Result.Success(Map(created!));
    }

    public async Task<Result<InventoryBatchResponse>> UpdateBatchAsync(Guid id, UpdateInventoryBatchRequest request, CancellationToken ct = default)
    {
        var batch = await _batches.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (batch is null) return Result.Failure<InventoryBatchResponse>("Inventory batch not found.");

        if (request.ReservedQuantity > request.CurrentQuantity)
            return Result.Failure<InventoryBatchResponse>("Reserved quantity cannot exceed current quantity.");

        batch.BatchNumber = request.BatchNumber.Trim();
        batch.MRP = request.MRP;
        batch.PurchasePrice = request.PurchasePrice;
        batch.PurchasePriceCode = _priceCode.Encode(request.PurchasePrice);
        batch.CurrentQuantity = request.CurrentQuantity;
        batch.ReservedQuantity = request.ReservedQuantity;
        batch.SoldQuantity = request.SoldQuantity;
        batch.DamagedQuantity = request.DamagedQuantity;
        batch.MinimumStockQuantity = request.MinimumStockQuantity;
        batch.PurchaseDate = NormalizeDate(request.PurchaseDate);
        batch.IsActive = request.IsActive;

        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(batch));
    }

    public async Task<Result<InventoryBatchResponse>> AdjustAsync(AdjustInventoryRequest request, CancellationToken ct = default)
    {
        var batch = await _batches.GetByIdAsync(request.InventoryBatchId, _currentUser.ShopId, ct);
        if (batch is null) return Result.Failure<InventoryBatchResponse>("Inventory batch not found.");

        var adjusted = batch.CurrentQuantity + request.QuantityDelta;
        if (adjusted < batch.ReservedQuantity)
            return Result.Failure<InventoryBatchResponse>("Current quantity cannot be lower than reserved quantity.");

        batch.CurrentQuantity = adjusted;
        if (request.QuantityDelta > 0)
            batch.InitialQuantity += request.QuantityDelta;

        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(batch));
    }

    private async Task<string> GenerateBatchNumberAsync(CancellationToken ct)
    {
        var count = await _context.InventoryBatches.CountAsync(x => x.ShopId == _currentUser.ShopId, ct);
        return $"BATCH-{DateTime.UtcNow:yyyyMMdd}-{count + 1:0000}";
    }

    private static DateTime NormalizeDate(DateTime date) =>
        date.Kind == DateTimeKind.Unspecified
            ? DateTime.SpecifyKind(date, DateTimeKind.Utc)
            : date.ToUniversalTime();

    private InventoryBatchResponse Map(InventoryBatch batch)
    {
        var canSeePurchasePrice = _currentUser.IsOwner;

        return new InventoryBatchResponse(
            batch.Id,
            batch.ProductId,
            batch.Product.ProductName,
            batch.DealerId,
            batch.Dealer.Name,
            batch.BatchNumber,
            batch.MRP,
            canSeePurchasePrice ? batch.PurchasePrice : null,
            batch.PurchasePriceCode,
            batch.InitialQuantity,
            batch.CurrentQuantity,
            batch.ReservedQuantity,
            batch.AvailableQuantity,
            batch.SoldQuantity,
            batch.DamagedQuantity,
            batch.MinimumStockQuantity,
            batch.PurchaseDate,
            batch.AvailableQuantity <= batch.MinimumStockQuantity,
            batch.IsActive);
    }
}
