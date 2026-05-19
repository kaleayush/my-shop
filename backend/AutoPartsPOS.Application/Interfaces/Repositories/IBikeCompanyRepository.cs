using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IBikeCompanyRepository
{
    Task<List<BikeCompany>> GetAllAsync(CancellationToken ct = default);
    Task<BikeCompany?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task AddAsync(BikeCompany company, CancellationToken ct = default);
}
