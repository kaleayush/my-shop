using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.Categories;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public CategoryService(ICategoryRepository categories, ICurrentUserService currentUser, IAppDbContext context)
    {
        _categories = categories;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<CategoryResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _categories.GetAllAsync(_currentUser.ShopId, ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<CategoryResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _categories.GetByIdAsync(id, ct);
        if (category is null) return Result.Failure<CategoryResponse>("Category not found.");
        return Result.Success(Map(category));
    }

    public async Task<Result<CategoryResponse>> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var category = new Category
        {
            ShopId = _currentUser.ShopId,
            Name = request.Name,
        };

        await _categories.AddAsync(category, ct);
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(category));
    }

    public async Task<Result<CategoryResponse>> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var category = await _categories.GetByIdAsync(id, ct);
        if (category is null) return Result.Failure<CategoryResponse>("Category not found.");
        if (category.ShopId != _currentUser.ShopId)
            return Result.Failure<CategoryResponse>("Cannot modify a global category.");

        category.Name = request.Name;
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(category));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _categories.GetByIdAsync(id, ct);
        if (category is null) return Result.Failure("Category not found.");
        if (category.ShopId != _currentUser.ShopId)
            return Result.Failure("Cannot modify a global category.");

        category.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static CategoryResponse Map(Category c) =>
        new(c.Id, c.Name, c.IsActive, c.ShopId is null);
}
