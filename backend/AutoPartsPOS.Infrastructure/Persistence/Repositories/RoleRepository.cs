using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly IAppDbContext _context;

    public RoleRepository(IAppDbContext context) => _context = context;

    public async Task<Role?> GetByNameAsync(UserRole name, CancellationToken ct = default) =>
        await _context.Roles.FirstOrDefaultAsync(r => r.Name == name, ct);
}
