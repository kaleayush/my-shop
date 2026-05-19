using AutoPartsPOS.Domain.Enums;

namespace AutoPartsPOS.Domain.Entities;

public class Role : BaseEntity
{
    public UserRole Name { get; set; }
    public string Description { get; set; } = string.Empty;

    public ICollection<User> Users { get; set; } = [];
}
