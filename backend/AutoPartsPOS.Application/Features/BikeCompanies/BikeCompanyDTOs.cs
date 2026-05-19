namespace AutoPartsPOS.Application.Features.BikeCompanies;

public record CreateBikeCompanyRequest(string Name);

public record UpdateBikeCompanyRequest(string Name);

public record BikeCompanyResponse(Guid Id, string Name, bool IsActive);
