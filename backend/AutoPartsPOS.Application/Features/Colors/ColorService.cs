using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.Colors;

public class ColorService : IColorService
{
    private readonly IColorRepository _colors;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public ColorService(IColorRepository colors, ICurrentUserService currentUser, IAppDbContext context)
    {
        _colors = colors;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<ColorResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _colors.GetAllAsync(_currentUser.ShopId, ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<ColorResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var color = await _colors.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (color is null) return Result.Failure<ColorResponse>("Color not found.");
        return Result.Success(Map(color));
    }

    public async Task<Result<ColorResponse>> CreateAsync(CreateColorRequest request, CancellationToken ct = default)
    {
        var color = new Color
        {
            ShopId = _currentUser.ShopId,
            Name = request.Name,
        };

        await _colors.AddAsync(color, ct);
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(color));
    }

    public async Task<Result<ColorResponse>> UpdateAsync(Guid id, UpdateColorRequest request, CancellationToken ct = default)
    {
        var color = await _colors.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (color is null) return Result.Failure<ColorResponse>("Color not found.");

        color.Name = request.Name;
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(color));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var color = await _colors.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (color is null) return Result.Failure("Color not found.");

        color.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static ColorResponse Map(Color c) => new(c.Id, c.Name, c.IsActive);
}
