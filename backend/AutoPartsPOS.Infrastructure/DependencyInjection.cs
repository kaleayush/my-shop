using AutoPartsPOS.Application.Interfaces;
using AutoPartsPOS.Application.Interfaces.Repositories;
using AutoPartsPOS.Application.Interfaces.Services;
using AutoPartsPOS.Infrastructure.Persistence;
using AutoPartsPOS.Infrastructure.Persistence.Repositories;
using AutoPartsPOS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AutoPartsPOS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(AppDbContext).Assembly.FullName)));

        services.AddScoped<IAppDbContext>(provider =>
            provider.GetRequiredService<AppDbContext>());

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IShopRepository, ShopRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IDealerRepository, DealerRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IBikeCompanyRepository, BikeCompanyRepository>();
        services.AddScoped<IBikeModelRepository, BikeModelRepository>();
        services.AddScoped<IColorRepository, ColorRepository>();
        services.AddScoped<IGraphicRepository, GraphicRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IInventoryBatchRepository, InventoryBatchRepository>();
        services.AddScoped<IPurchaseBillRepository, PurchaseBillRepository>();
        services.AddScoped<IDraftSaleRepository, DraftSaleRepository>();
        services.AddScoped<IStockReservationRepository, StockReservationRepository>();
        services.AddScoped<ISaleRepository, SaleRepository>();

        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        var claudeApiKey = configuration["Anthropic:ApiKey"]
            ?? throw new InvalidOperationException("Anthropic:ApiKey is not configured. Set via user secrets or environment variable.");

        var claudeHttp = new HttpClient { Timeout = TimeSpan.FromSeconds(60) };
        services.AddSingleton<IPdfTextExtractor, PdfPigTextExtractor>();
        services.AddSingleton<IClaudeProductLineParser>(_ => new ClaudeProductLineParser(claudeHttp, claudeApiKey));
        services.AddScoped<IPurchaseBillTextExtractor>( provider=>
            new ClaudePurchaseBillExtractor(
                provider.GetRequiredService<IPdfTextExtractor>(),
                provider.GetRequiredService<IClaudeProductLineParser>()));

        return services;
    }
}
