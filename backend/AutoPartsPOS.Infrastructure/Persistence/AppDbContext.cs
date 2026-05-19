using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Infrastructure.Persistence;

public class AppDbContext : DbContext, IAppDbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Dealer> Dealers => Set<Dealer>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<BikeCompany> BikeCompanies => Set<BikeCompany>();
    public DbSet<BikeModel> BikeModels => Set<BikeModel>();
    public DbSet<Color> Colors => Set<Color>();
    public DbSet<Graphic> Graphics => Set<Graphic>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<InventoryBatch> InventoryBatches => Set<InventoryBatch>();
    public DbSet<PurchaseBill> PurchaseBills => Set<PurchaseBill>();
    public DbSet<PurchaseBillItem> PurchaseBillItems => Set<PurchaseBillItem>();
    public DbSet<DraftSale> DraftSales => Set<DraftSale>();
    public DbSet<DraftSaleItem> DraftSaleItems => Set<DraftSaleItem>();
    public DbSet<StockReservation> StockReservations => Set<StockReservation>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<SaleItem> SaleItems => Set<SaleItem>();
    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<CustomerCredit> CustomerCredits => Set<CustomerCredit>();
    public DbSet<DealerPayment> DealerPayments => Set<DealerPayment>();
    public DbSet<Return> Returns => Set<Return>();
    public DbSet<DamagedStock> DamagedStocks => Set<DamagedStock>();
    public DbSet<ReorderItem> ReorderItems => Set<ReorderItem>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateAuditTimestamps();
        return base.SaveChangesAsync(cancellationToken);
    }

    private void UpdateAuditTimestamps()
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is AuditableEntity &&
                        e.State is EntityState.Added or EntityState.Modified);

        foreach (var entry in entries)
        {
            var entity = (AuditableEntity)entry.Entity;
            entity.UpdatedAt = DateTime.UtcNow;
            if (entry.State == EntityState.Added)
                entity.CreatedAt = DateTime.UtcNow;
        }
    }
}
