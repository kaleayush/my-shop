namespace AutoPartsPOS.Application.Features.Auth.DTOs;

public record RegisterShopOwnerRequest(
    string ShopName,
    string OwnerName,
    string Phone,
    string? Address,
    string Email,
    string Password
);
