namespace AutoPartsPOS.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid ShopId { get; set; }
    public Guid UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public Guid EntityId { get; set; }
    public string? OldValueJson { get; set; }
    public string? NewValueJson { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
