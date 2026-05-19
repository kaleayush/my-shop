using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.Dealers;

public class DealerService : IDealerService
{
    private readonly IDealerRepository _dealers;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public DealerService(IDealerRepository dealers, ICurrentUserService currentUser, IAppDbContext context)
    {
        _dealers = dealers;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<List<DealerResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _dealers.GetAllAsync(_currentUser.ShopId, ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<DealerResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var dealer = await _dealers.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (dealer is null) return Result.Failure<DealerResponse>("Dealer not found.");
        return Result.Success(Map(dealer));
    }

    public async Task<Result<DealerResponse>> CreateAsync(CreateDealerRequest request, CancellationToken ct = default)
    {
        var dealer = new Dealer
        {
            ShopId = _currentUser.ShopId,
            Name = request.Name,
            Phone = request.Phone,
            Address = request.Address,
            Notes = request.Notes,
        };

        await _dealers.AddAsync(dealer, ct);
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(dealer));
    }

    public async Task<Result<DealerResponse>> UpdateAsync(Guid id, UpdateDealerRequest request, CancellationToken ct = default)
    {
        var dealer = await _dealers.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (dealer is null) return Result.Failure<DealerResponse>("Dealer not found.");

        dealer.Name = request.Name;
        dealer.Phone = request.Phone;
        dealer.Address = request.Address;
        dealer.Notes = request.Notes;

        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(dealer));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var dealer = await _dealers.GetByIdAsync(id, _currentUser.ShopId, ct);
        if (dealer is null) return Result.Failure("Dealer not found.");

        dealer.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static DealerResponse Map(Dealer d) =>
        new(d.Id, d.Name, d.Phone, d.Address, d.Notes, d.IsActive);
}
