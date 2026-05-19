using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Features.BikeModels;

public class BikeModelService : IBikeModelService
{
    private readonly IBikeModelRepository _models;
    private readonly IBikeCompanyRepository _companies;
    private readonly IAppDbContext _context;

    public BikeModelService(IBikeModelRepository models, IBikeCompanyRepository companies, IAppDbContext context)
    {
        _models = models;
        _companies = companies;
        _context = context;
    }

    public async Task<Result<List<BikeModelResponse>>> GetAllAsync(CancellationToken ct = default)
    {
        var list = await _models.GetAllAsync(ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<List<BikeModelResponse>>> GetByCompanyAsync(Guid bikeCompanyId, CancellationToken ct = default)
    {
        var list = await _models.GetByCompanyAsync(bikeCompanyId, ct);
        return Result.Success(list.Select(Map).ToList());
    }

    public async Task<Result<BikeModelResponse>> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var model = await _models.GetByIdAsync(id, ct);
        if (model is null) return Result.Failure<BikeModelResponse>("Bike model not found.");
        return Result.Success(Map(model));
    }

    public async Task<Result<BikeModelResponse>> CreateAsync(CreateBikeModelRequest request, CancellationToken ct = default)
    {
        var company = await _companies.GetByIdAsync(request.BikeCompanyId, ct);
        if (company is null) return Result.Failure<BikeModelResponse>("Bike company not found.");

        var model = new BikeModel
        {
            BikeCompanyId = request.BikeCompanyId,
            Name = request.Name,
        };

        await _models.AddAsync(model, ct);
        await _context.SaveChangesAsync(ct);

        model.BikeCompany = company;
        return Result.Success(Map(model));
    }

    public async Task<Result<BikeModelResponse>> UpdateAsync(Guid id, UpdateBikeModelRequest request, CancellationToken ct = default)
    {
        var model = await _models.GetByIdAsync(id, ct);
        if (model is null) return Result.Failure<BikeModelResponse>("Bike model not found.");

        model.Name = request.Name;
        await _context.SaveChangesAsync(ct);
        return Result.Success(Map(model));
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var model = await _models.GetByIdAsync(id, ct);
        if (model is null) return Result.Failure("Bike model not found.");

        model.IsActive = false;
        await _context.SaveChangesAsync(ct);
        return Result.Success();
    }

    private static BikeModelResponse Map(BikeModel m) =>
        new(m.Id, m.BikeCompanyId, m.BikeCompany?.Name ?? string.Empty, m.Name, m.IsActive);
}
