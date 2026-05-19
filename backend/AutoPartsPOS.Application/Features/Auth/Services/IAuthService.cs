using AutoPartsPOS.Application.Common;
using AutoPartsPOS.Application.Features.Auth.DTOs;

namespace AutoPartsPOS.Application.Features.Auth.Services;

public interface IAuthService
{
    Task<Result<LoginResponse>> RegisterShopOwnerAsync(RegisterShopOwnerRequest request, CancellationToken ct = default);
    Task<Result<LoginResponse>> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<Result<CurrentUserResponse>> GetCurrentUserAsync(CancellationToken ct = default);
}
