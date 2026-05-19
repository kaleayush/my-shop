using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Application.Interfaces.Repositories;

public interface IRoleRepository
{
    Task<Role?> GetByNameAsync(UserRole name, CancellationToken ct = default);
}
