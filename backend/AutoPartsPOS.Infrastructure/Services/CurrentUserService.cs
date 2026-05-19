using AutoPartsPOS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace AutoPartsPOS.Infrastructure.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _http;

    public CurrentUserService(IHttpContextAccessor http) => _http = http;

    public Guid UserId =>
        Guid.Parse(_http.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? _http.HttpContext?.User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("User not authenticated."));

    public Guid ShopId =>
        Guid.Parse(_http.HttpContext?.User.FindFirstValue("shopId")
            ?? throw new UnauthorizedAccessException("ShopId claim missing."));

    public string Role =>
        _http.HttpContext?.User.FindFirstValue(ClaimTypes.Role)
            ?? throw new UnauthorizedAccessException("Role claim missing.");

    public bool IsOwner => Role == "ShopOwner";
}
