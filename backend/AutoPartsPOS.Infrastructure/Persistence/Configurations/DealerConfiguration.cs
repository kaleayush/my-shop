using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace AutoPartsPOS.Infrastructure.Persistence.Configurations;

public class DealerConfiguration : IEntityTypeConfiguration<Dealer>
{
    public void Configure(EntityTypeBuilder<Dealer> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Phone).HasMaxLength(20);
        builder.Property(x => x.Address).HasMaxLength(300);
        builder.Property(x => x.Notes).HasMaxLength(500);

        builder.HasOne(x => x.Shop)
            .WithMany()
            .HasForeignKey(x => x.ShopId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
