namespace AutoPartsPOS.Domain.Entities;

public class BikeModel : BaseEntity
{
    public Guid BikeCompanyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public BikeCompany BikeCompany { get; set; } = null!;
}
