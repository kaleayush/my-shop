using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoPartsPOS.Infrastructure.Persistence.Configurations;

public class GraphicConfiguration : IEntityTypeConfiguration<Graphic>
{
    public void Configure(EntityTypeBuilder<Graphic> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);

        builder.HasOne<Shop>()
            .WithMany()
            .HasForeignKey(x => x.ShopId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
