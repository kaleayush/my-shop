using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IBikeModelRepository
{
    Task<List<BikeModel>> GetAllAsync(CancellationToken ct = default);
    Task<List<BikeModel>> GetByCompanyAsync(Guid bikeCompanyId, CancellationToken ct = default);
    Task<BikeModel?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(BikeModel model, CancellationToken ct = default);
}
