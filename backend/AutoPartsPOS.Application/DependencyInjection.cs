using AutoPartsPOS.Application.Features.Auth.Services;
using AutoPartsPOS.Application.Features.BikeCompanies;
using AutoPartsPOS.Application.Features.BikeModels;
using AutoPartsPOS.Application.Features.Brands;
using AutoPartsPOS.Application.Features.Categories;
using AutoPartsPOS.Application.Features.Colors;
using AutoPartsPOS.Application.Features.Dealers;
using AutoPartsPOS.Application.Features.Graphics;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace AutoPartsPOS.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(typeof(DependencyInjection).Assembly);
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IDealerService, DealerService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IBikeCompanyService, BikeCompanyService>();
        services.AddScoped<IBikeModelService, BikeModelService>();
        services.AddScoped<IColorService, ColorService>();
        services.AddScoped<IGraphicService, GraphicService>();
        return services;
    }
}
