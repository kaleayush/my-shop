using AutoPartsPOS.Domain.Entities;
using AutoPartsPOS.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoPartsPOS.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired();
        builder.Property(x => x.Description).HasMaxLength(200);
        builder.HasIndex(x => x.Name).IsUnique();

        builder.HasData(
            new Role { Id = Guid.Parse("11111111-0000-0000-0000-000000000001"), Name = UserRole.SuperAdmin, Description = "SaaS super admin" },
            new Role { Id = Guid.Parse("11111111-0000-0000-0000-000000000002"), Name = UserRole.ShopOwner, Description = "Shop owner with full access" },
            new Role { Id = Guid.Parse("11111111-0000-0000-0000-000000000003"), Name = UserRole.Manager, Description = "Shop manager" },
            new Role { Id = Guid.Parse("11111111-0000-0000-0000-000000000004"), Name = UserRole.SalesStaff, Description = "Sales staff" },
            new Role { Id = Guid.Parse("11111111-0000-0000-0000-000000000005"), Name = UserRole.InventoryStaff, Description = "Inventory staff" }
        );
    }
}
