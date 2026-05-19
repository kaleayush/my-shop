using AutoPartsPOS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AutoPartsPOS.Application.Interfaces;

public interface IAppDbContext
{
    DbSet<Shop> Shops { get; }
    DbSet<User> Users { get; }
    DbSet<Role> Roles { get; }
    DbSet<Dealer> Dealers { get; }
    DbSet<Category> Categories { get; }
    DbSet<Brand> Brands { get; }
    DbSet<BikeCompany> BikeCompanies { get; }
    DbSet<BikeModel> BikeModels { get; }
    DbSet<Color> Colors { get; }
    DbSet<Graphic> Graphics { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<InventoryBatch> InventoryBatches { get; }
    DbSet<PurchaseBill> PurchaseBills { get; }
    DbSet<PurchaseBillItem> PurchaseBillItems { get; }
    DbSet<DraftSale> DraftSales { get; }
    DbSet<DraftSaleItem> DraftSaleItems { get; }
    DbSet<StockReservation> StockReservations { get; }
    DbSet<Sale> Sales { get; }
    DbSet<SaleItem> SaleItems { get; }
    DbSet<Payment> Payments { get; }
    DbSet<CustomerCredit> CustomerCredits { get; }
    DbSet<DealerPayment> DealerPayments { get; }
    DbSet<Return> Returns { get; }
    DbSet<DamagedStock> DamagedStocks { get; }
    DbSet<ReorderItem> ReorderItems { get; }
    DbSet<AuditLog> AuditLogs { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
