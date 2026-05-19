namespace AutoPartsPOS.Application.Interfaces.Services;

public interface ICurrentUserService
{
    Guid UserId { get; }
    Guid ShopId { get; }
    string Role { get; }
    bool IsOwner { get; }
}
