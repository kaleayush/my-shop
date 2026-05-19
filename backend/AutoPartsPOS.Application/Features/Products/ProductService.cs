using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Application.Features.Products;

public class ProductService : IProductService
{
    private readonly IProductRepository _products;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public ProductService(IProductRepository products, ICurrentUserService currentUser, IAppDbContext context)
    {
        _products = products;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<ProductResponse>>> SearchAsync(ProductSearchRequest request, CancellationToken ct = default)
    {
        var products = await _products.SearchAsync(
            _currentUser.ShopId,
            request.Query,
            request.CategoryId,
            request.DealerId,
            request.IncludeInactive,
            ct);

        return Result.Success(products.Select(MapList).ToList());
    }

    public async Task<Result<ProductDetailResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _products.GetByIdWithDetailsAsync(id, _currentUser.ShopId, ct);
        if (product is null) return Result.Failure<ProductDetailResponse>("Product not found.");
        return Result.Success(MapDetail(product, _currentUser.IsOwner));
    }

    public async Task<Result<ProductDetailResponse>> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var validation = await ValidateReferencesAsync(request.CategoryId, request.BrandId, request.BikeCompanyId, request.BikeModelId, request.ColorId, request.GraphicId, ct);
        if (validation.IsFailure) return Result.Failure<ProductDetailResponse>(validation.Error!);

        var product = new Product
        {
            ShopId = _currentUser.ShopId,
            ProductName = request.ProductName.Trim(),
            CategoryId = request.CategoryId,
            BrandId = request.BrandId,
            BikeCompanyId = request.BikeCompanyId,
            BikeModelId = request.BikeModelId,
            ColorId = request.ColorId,
            GraphicId = request.GraphicId,
            MRP = request.MRP,
            HindiName = NormalizeOptional(request.HindiName),
            SearchKeywords = NormalizeOptional(request.SearchKeywords),
            Barcode = NormalizeOptional(request.Barcode),
            QRCode = NormalizeOptional(request.QRCode),
            MinimumStockQuantity = request.MinimumStockQuantity,
            IsActive = true,
        };

        await _products.AddAsync(product, ct);
        await _context.SaveChangesAsync(ct);

        var created = await _products.GetByIdWithDetailsAsync(product.Id, _currentUser.ShopId, ct);
        return Result.Success(MapDetail(created!, _currentUser.IsOwner));
    }

    public async Task<Result<ProductDetailResponse>> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await _products.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (product is null) return Result.Failure<ProductDetailResponse>("Product not found.");

        var validation = await ValidateReferencesAsync(request.CategoryId, request.BrandId, request.BikeCompanyId, request.BikeModelId, request.ColorId, request.GraphicId, ct);
        if (validation.IsFailure) return Result.Failure<ProductDetailResponse>(validation.Error!);

        product.ProductName = request.ProductName.Trim();
        product.CategoryId = request.CategoryId;
        product.BrandId = request.BrandId;
        product.BikeCompanyId = request.BikeCompanyId;
        product.BikeModelId = request.BikeModelId;
        product.ColorId = request.ColorId;
        product.GraphicId = request.GraphicId;
        product.MRP = request.MRP;
        product.HindiName = NormalizeOptional(request.HindiName);
        product.SearchKeywords = NormalizeOptional(request.SearchKeywords);
        product.Barcode = NormalizeOptional(request.Barcode);
        product.QRCode = NormalizeOptional(request.QRCode);
        product.MinimumStockQuantity = request.MinimumStockQuantity;
        product.IsActive = request.IsActive;

        await _context.SaveChangesAsync(ct);

        var updated = await _products.GetByIdWithDetailsAsync(product.Id, _currentUser.ShopId, ct);
        return Result.Success(MapDetail(updated!, _currentUser.IsOwner));
    }

    public async Task<Result<ProductImageResponse>> AddImageAsync(Guid productId, AddProductImageRequest request, CancellationToken ct = default)
    {
        var product = await _products.GetByIdWithDetailsAsync(productId, _currentUser.ShopId, ct);
        if (product is null) return Result.Failure<ProductImageResponse>("Product not found.");

        if (request.IsPrimary)
        {
            foreach (var existing in product.Images)
                existing.IsPrimary = false;
        }

        var image = new ProductImage
        {
            ShopId = _currentUser.ShopId,
            ProductId = productId,
            ImageUrl = request.ImageUrl.Trim(),
            IsPrimary = request.IsPrimary || !product.Images.Any(),
        };

        product.Images.Add(image);
        await _context.SaveChangesAsync(ct);

        return Result.Success(new ProductImageResponse(image.Id, image.ImageUrl, image.IsPrimary, image.CreatedAt));
    }

    private async Task<Result> ValidateReferencesAsync(
        Guid? categoryId,
        Guid? brandId,
        Guid? bikeCompanyId,
        Guid? bikeModelId,
        Guid? colorId,
        Guid? graphicId,
        CancellationToken ct)
    {
        var shopId = _currentUser.ShopId;

        if (categoryId.HasValue && !await _context.Categories.AnyAsync(x => x.Id == categoryId && x.IsActive && (x.ShopId == null || x.ShopId == shopId), ct))
            return Result.Failure("Category not found.");

        if (brandId.HasValue && !await _context.Brands.AnyAsync(x => x.Id == brandId && x.IsActive && x.ShopId == shopId, ct))
            return Result.Failure("Brand not found.");

        if (bikeCompanyId.HasValue && !await _context.BikeCompanies.AnyAsync(x => x.Id == bikeCompanyId && x.IsActive, ct))
            return Result.Failure("Bike company not found.");

        if (bikeModelId.HasValue)
        {
            var modelExists = await _context.BikeModels.AnyAsync(x =>
                x.Id == bikeModelId &&
                x.IsActive &&
                (!bikeCompanyId.HasValue || x.BikeCompanyId == bikeCompanyId),
                ct);

            if (!modelExists) return Result.Failure("Bike model not found.");
        }

        if (colorId.HasValue && !await _context.Colors.AnyAsync(x => x.Id == colorId && x.IsActive && x.ShopId == shopId, ct))
            return Result.Failure("Color not found.");

        if (graphicId.HasValue && !await _context.Graphics.AnyAsync(x => x.Id == graphicId && x.IsActive && x.ShopId == shopId, ct))
            return Result.Failure("Graphic not found.");

        return Result.Success();
    }

    private static string? NormalizeOptional(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static ProductResponse MapList(Product p)
    {
        var total = p.InventoryBatches.Where(b => b.IsActive).Sum(b => b.CurrentQuantity);
        var reserved = p.InventoryBatches.Where(b => b.IsActive).Sum(b => b.ReservedQuantity);

        return new ProductResponse(
            p.Id,
            p.ProductName,
            p.CategoryId,
            p.Category?.Name,
            p.BrandId,
            p.Brand?.Name,
            p.BikeCompanyId,
            p.BikeCompany?.Name,
            p.BikeModelId,
            p.BikeModel?.Name,
            p.ColorId,
            p.Color?.Name,
            p.GraphicId,
            p.Graphic?.Name,
            p.MRP,
            p.HindiName,
            p.SearchKeywords,
            p.Barcode,
            p.QRCode,
            p.MinimumStockQuantity,
            total,
            reserved,
            total - reserved,
            p.Images.OrderByDescending(i => i.IsPrimary).ThenBy(i => i.CreatedAt).FirstOrDefault()?.ImageUrl,
            p.IsActive);
    }

    private static ProductDetailResponse MapDetail(Product p, bool canSeePurchasePrice)
    {
        var list = MapList(p);
        var batches = p.InventoryBatches
            .Where(b => b.IsActive)
            .OrderBy(b => b.Dealer.Name)
            .ThenBy(b => b.BatchNumber)
            .Select(b => new ProductBatchSummaryResponse(
                b.Id,
                b.DealerId,
                b.Dealer.Name,
                b.BatchNumber,
                b.MRP,
                canSeePurchasePrice ? b.PurchasePrice : null,
                b.PurchasePriceCode,
                b.CurrentQuantity,
                b.ReservedQuantity,
                b.AvailableQuantity,
                b.MinimumStockQuantity,
                b.PurchaseDate,
                b.AvailableQuantity <= b.MinimumStockQuantity))
            .ToList();

        var images = p.Images
            .OrderByDescending(i => i.IsPrimary)
            .ThenBy(i => i.CreatedAt)
            .Select(i => new ProductImageResponse(i.Id, i.ImageUrl, i.IsPrimary, i.CreatedAt))
            .ToList();

        return new ProductDetailResponse(
            list.Id,
            list.ProductName,
            list.CategoryId,
            list.CategoryName,
            list.BrandId,
            list.BrandName,
            list.BikeCompanyId,
            list.BikeCompanyName,
            list.BikeModelId,
            list.BikeModelName,
            list.ColorId,
            list.ColorName,
            list.GraphicId,
            list.GraphicName,
            list.MRP,
            list.HindiName,
            list.SearchKeywords,
            list.Barcode,
            list.QRCode,
            list.MinimumStockQuantity,
            list.TotalQuantity,
            list.ReservedQuantity,
            list.AvailableQuantity,
            list.IsActive,
            images,
            batches);
    }
}
