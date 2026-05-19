using AutoPartsPOS.Application.Features.Categories;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/categories")]
[Authorize]
public class CategoriesController : BaseApiController
{
    private readonly ICategoryService _categories;
    private readonly IValidator<CreateCategoryRequest> _createValidator;
    private readonly IValidator<UpdateCategoryRequest> _updateValidator;

    public CategoriesController(
        ICategoryService categories,
        IValidator<CreateCategoryRequest> createValidator,
        IValidator<UpdateCategoryRequest> updateValidator)
    {
        _categories = categories;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _categories.GetAllAsync(ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _categories.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _categories.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return CreatedResponse(nameof(GetById), new { id = result.Value!.Id }, result.Value, "Category created successfully");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateCategoryRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _categories.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value, "Category updated successfully");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _categories.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return DeletedResponse("Category deleted successfully");
    }
}
