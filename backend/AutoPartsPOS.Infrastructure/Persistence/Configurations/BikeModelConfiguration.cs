using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoPartsPOS.Infrastructure.Persistence.Configurations;

public class BikeModelConfiguration : IEntityTypeConfiguration<BikeModel>
{
    public void Configure(EntityTypeBuilder<BikeModel> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.HasOne(x => x.BikeCompany)
            .WithMany(x => x.BikeModels)
            .HasForeignKey(x => x.BikeCompanyId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
