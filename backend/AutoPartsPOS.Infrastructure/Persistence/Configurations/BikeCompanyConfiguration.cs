using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoPartsPOS.Infrastructure.Persistence.Configurations;

public class BikeCompanyConfiguration : IEntityTypeConfiguration<BikeCompany>
{
    public void Configure(EntityTypeBuilder<BikeCompany> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
    }
}
