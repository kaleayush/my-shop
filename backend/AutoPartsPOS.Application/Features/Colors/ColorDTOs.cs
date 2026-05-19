namespace AutoPartsPOS.Application.Features.Colors;

public record CreateColorRequest(string Name);

public record UpdateColorRequest(string Name);

public record ColorResponse(Guid Id, string Name, bool IsActive);
