namespace AutoPartsPOS.Application.Features.Graphics;

public record CreateGraphicRequest(string Name);

public record UpdateGraphicRequest(string Name);

public record GraphicResponse(Guid Id, string Name, bool IsActive);
