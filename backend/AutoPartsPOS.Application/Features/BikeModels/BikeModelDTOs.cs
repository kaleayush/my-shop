namespace AutoPartsPOS.Application.Features.BikeModels;

public record CreateBikeModelRequest(Guid BikeCompanyId, string Name);

public record UpdateBikeModelRequest(string Name);

public record BikeModelResponse(Guid Id, Guid BikeCompanyId, string BikeCompanyName, string Name, bool IsActive);
