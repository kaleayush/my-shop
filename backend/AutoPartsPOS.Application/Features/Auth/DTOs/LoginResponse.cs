namespace AutoPartsPOS.Application.Features.Auth.DTOs;

public record LoginResponse(
    string Token,
    string FullName,
    string Email,
    string Role,
    Guid ShopId,
    string ShopName
);
