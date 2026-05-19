namespace AutoPartsPOS.Domain.Entities;

public class Shop : AuditableEntity
{
    public string ShopCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<User> Users { get; set; } = [];
}
