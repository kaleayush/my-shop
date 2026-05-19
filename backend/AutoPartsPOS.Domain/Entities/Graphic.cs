namespace AutoPartsPOS.Domain.Entities;

public class Graphic : BaseEntity
{
    public Guid ShopId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
