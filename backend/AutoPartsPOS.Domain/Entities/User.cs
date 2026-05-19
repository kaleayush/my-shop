namespace AutoPartsPOS.Domain.Entities;

public class User : AuditableEntity
{
    public Guid ShopId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PasswordHash { get; set; } = string.Empty;
    public Guid RoleId { get; set; }
    public bool IsActive { get; set; } = true;

    public Shop Shop { get; set; } = null!;
    public Role Role { get; set; } = null!;
}
