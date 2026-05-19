using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly AppDbContext _context;

    public ProductRepository(AppDbContext context) => _context = context;

    public async Task<List<Product>> SearchAsync(
        Guid shopId,
        string? query,
        Guid? categoryId,
        Guid? dealerId,
        bool includeInactive,
        CancellationToken ct = default)
    {
        var products = BaseQuery(shopId)
            .Where(p => includeInactive || p.IsActive);

        if (categoryId.HasValue)
            products = products.Where(p => p.CategoryId == categoryId);

        if (dealerId.HasValue)
            products = products.Where(p => p.InventoryBatches.Any(b => b.DealerId == dealerId && b.IsActive));

        if (!string.IsNullOrWhiteSpace(query))
        {
            var term = query.Trim().ToLower();
            products = products.Where(p =>
                p.ProductName.ToLower().Contains(term) ||
                (p.HindiName != null && p.HindiName.ToLower().Contains(term)) ||
                (p.SearchKeywords != null && p.SearchKeywords.ToLower().Contains(term)) ||
                (p.Category != null && p.Category.Name.ToLower().Contains(term)) ||
                (p.Brand != null && p.Brand.Name.ToLower().Contains(term)) ||
                (p.BikeCompany != null && p.BikeCompany.Name.ToLower().Contains(term)) ||
                (p.BikeModel != null && p.BikeModel.Name.ToLower().Contains(term)) ||
                (p.Color != null && p.Color.Name.ToLower().Contains(term)) ||
                (p.Graphic != null && p.Graphic.Name.ToLower().Contains(term)) ||
                p.InventoryBatches.Any(b => b.Dealer.Name.ToLower().Contains(term)));
        }

        return await products
            .OrderBy(p => p.ProductName)
            .Take(100)
            .ToListAsync(ct);
    }

    public async Task<Product?> GetByIdAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await _context.Products.FirstOrDefaultAsync(p => p.Id == id && p.ShopId == shopId, ct);

    public async Task<Product?> GetByIdWithDetailsAsync(Guid id, Guid shopId, CancellationToken ct = default) =>
        await BaseQuery(shopId).FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task AddAsync(Product product, CancellationToken ct = default) =>
        await _context.Products.AddAsync(product, ct);

    private IQueryable<Product> BaseQuery(Guid shopId) =>
        _context.Products
            .Where(p => p.ShopId == shopId)
            .Include(p => p.Category)
            .Include(p => p.Brand)
            .Include(p => p.BikeCompany)
            .Include(p => p.BikeModel)
            .Include(p => p.Color)
            .Include(p => p.Graphic)
            .Include(p => p.Images)
            .Include(p => p.InventoryBatches)
                .ThenInclude(b => b.Dealer);
}
