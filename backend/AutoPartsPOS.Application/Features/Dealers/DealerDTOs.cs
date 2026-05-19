namespace AutoPartsPOS.Application.Features.Dealers;

public record CreateDealerRequest(
    string Name,
    string? Phone,
    string? Address,
    string? Notes
);

public record UpdateDealerRequest(
    string Name,
    string? Phone,
    string? Address,
    string? Notes
);

public record DealerResponse(
    Guid Id,
    string Name,
    string? Phone,
    string? Address,
    string? Notes,
    bool IsActive
);
