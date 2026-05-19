namespace AutoPartsPOS.Application.Features.Brands;

public record CreateBrandRequest(string Name);

public record UpdateBrandRequest(string Name);

public record BrandResponse(Guid Id, string Name, bool IsActive);
