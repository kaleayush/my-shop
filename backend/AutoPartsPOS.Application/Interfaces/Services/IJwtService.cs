using AutoPartsPOS.Domain.Entities;

namespace AutoPartsPOS.Application.Interfaces.Services;

public interface IJwtService
{
    string GenerateToken(User user, string roleName, string shopName);
}
