using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.Graphics;

public class GraphicService : IGraphicService
{
    private readonly IGraphicRepository _graphics;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public GraphicService(IGraphicRepository graphics, ICurrentUserService currentUser, IAppDbContext context)
    {
        _graphics = graphics;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<GraphicResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _graphics.GetAllAsync(_currentUser.ShopId, ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<GraphicResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var graphic = await _graphics.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (graphic is null) return Result.Failure<GraphicResponse>("Graphic not found.");
        return Result.Success(Map(graphic));
    }

    public async Task<Result<GraphicResponse>> CreateAsync(CreateGraphicRequest request, CancellationToken ct = default)
    {
        var graphic = new Graphic
        {
            ShopId = _currentUser.ShopId,
            Name = request.Name,
        };

        await _graphics.AddAsync(graphic, ct);
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(graphic));
    }

    public async Task<Result<GraphicResponse>> UpdateAsync(Guid id, UpdateGraphicRequest request, CancellationToken ct = default)
    {
        var graphic = await _graphics.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (graphic is null) return Result.Failure<GraphicResponse>("Graphic not found.");

        graphic.Name = request.Name;
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(graphic));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var graphic = await _graphics.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (graphic is null) return Result.Failure("Graphic not found.");

        graphic.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static GraphicResponse Map(Graphic g) => new(g.Id, g.Name, g.IsActive);
}
