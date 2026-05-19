using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Features.Auth.DTOs;
using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Application.Features.Auth.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _users;
    private readonly IShopRepository _shops;
    private readonly IRoleRepository _roles;
    private readonly IJwtService _jwt;
    private readonly IPasswordHasher _hasher;
    private readonly ICurrentUserService _currentUser;
    private readonly IAppDbContext _context;

    public AuthService(
        IUserRepository users,
        IShopRepository shops,
        IRoleRepository roles,
        IJwtService jwt,
        IPasswordHasher hasher,
        ICurrentUserService currentUser,
        IAppDbContext context)
    {
        _users = users;
        _shops = shops;
        _roles = roles;
        _jwt = jwt;
        _hasher = hasher;
        _currentUser = currentUser;
        _context = context;
    }

    public async Task<Result<LoginResponse>> RegisterShopOwnerAsync(
        RegisterShopOwnerRequest request, CancellationToken ct = default)
    {
        if (await _users.EmailExistsAsync(request.Email, ct))
            return Result.Failure<LoginResponse>("Email already registered.");

        var role = await _roles.GetByNameAsync(UserRole.ShopOwner, ct);
        if (role is null)
            return Result.Failure<LoginResponse>("ShopOwner role not seeded. Contact admin.");

        var shopCode = GenerateShopCode(request.ShopName);
        while (await _shops.ShopCodeExistsAsync(shopCode, ct))
            shopCode = GenerateShopCode(request.ShopName);

        var shop = new Shop
        {
            ShopCode = shopCode,
            Name = request.ShopName,
            OwnerName = request.OwnerName,
            Phone = request.Phone,
            Address = request.Address,
        };

        var user = new User
        {
            ShopId = shop.Id,
            FullName = request.OwnerName,
            Email = request.Email.ToLowerInvariant(),
            Phone = request.Phone,
            PasswordHash = _hasher.Hash(request.Password),
            RoleId = role.Id,
        };

        await _shops.AddAsync(shop, ct);
        await _users.AddAsync(user, ct);
        await _context.SaveChangesAsync(ct);

        var token = _jwt.GenerateToken(user, role.Name.ToString(), shop.Name);
        return Result.Success(new LoginResponse(token, user.FullName, user.Email, role.Name.ToString(), shop.Id, shop.Name));
    }

    public async Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByEmailAsync(request.Email.ToLowerInvariant(), ct);
        if (user is null || !_hasher.Verify(request.Password, user.PasswordHash))
            return Result.Failure<LoginResponse>("Invalid email or password.");

        if (!user.IsActive)
            return Result.Failure<LoginResponse>("Account is inactive.");

        var shop = await _shops.GetByIdAsync(user.ShopId, ct);
        if (shop is null)
            return Result.Failure<LoginResponse>("Shop not found.");

        var token = _jwt.GenerateToken(user, user.Role.Name.ToString(), shop.Name);
        return Result.Success(new LoginResponse(token, user.FullName, user.Email, user.Role.Name.ToString(), shop.Id, shop.Name));
    }

    public async Task<Result<CurrentUserResponse>> GetCurrentUserAsync(CancellationToken ct = default)
    {
        var user = await _users.GetByIdWithRoleAsync(_currentUser.UserId, ct);
        if (user is null)
            return Result.Failure<CurrentUserResponse>("User not found.");

        var shop = await _shops.GetByIdAsync(user.ShopId, ct);
        if (shop is null)
            return Result.Failure<CurrentUserResponse>("Shop not found.");

        return Result.Success(new CurrentUserResponse(
            user.Id,
            user.FullName,
            user.Email,
            user.Phone,
            user.Role.Name.ToString(),
            shop.Id,
            shop.Name,
            user.Role.Name == UserRole.ShopOwner
        ));
    }

    private static string GenerateShopCode(string shopName)
    {
        var prefix = new string(shopName
            .ToUpperInvariant()
            .Where(char.IsLetter)
            .Take(4)
            .ToArray());
        if (prefix.Length < 3) prefix = prefix.PadRight(3, 'X');
        var suffix = Random.Shared.Next(100, 999).ToString();
        return $"{prefix}{suffix}";
    }
}
