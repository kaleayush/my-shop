namespace AutoPartsPOS.Application.Features.Categories;

public record CreateCategoryRequest(string Name);

public record UpdateCategoryRequest(string Name);

public record CategoryResponse(Guid Id, string Name, bool IsActive, bool IsGlobal);
