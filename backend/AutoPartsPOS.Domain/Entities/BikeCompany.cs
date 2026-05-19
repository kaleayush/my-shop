namespace AutoPartsPOS.Domain.Entities;

public class BikeCompany : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;

    public ICollection<BikeModel> BikeModels { get; set; } = [];
}
