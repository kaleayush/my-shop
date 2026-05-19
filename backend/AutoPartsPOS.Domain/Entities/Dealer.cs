namespace AutoPartsPOS.Domain.Entities;

public class Dealer : AuditableEntity
{
    public Guid ShopId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Notes { get; set; }
    public bool IsActive { get; set; } = true;

    public Shop Shop { get; set; } = null!;
}
