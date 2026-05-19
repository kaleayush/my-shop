namespace AutoPartsPOS.Application.Features.Auth.DTOs;

public record CurrentUserResponse(
    Guid Id,
    string FullName,
    string Email,
    string? Phone,
    string Role,
    Guid ShopId,
    string ShopName,
    bool IsOwner
);
