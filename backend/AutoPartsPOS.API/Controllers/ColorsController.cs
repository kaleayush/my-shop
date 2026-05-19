using AutoPartsPOS.Application.Features.Colors;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/colors")]
[Authorize]
public class ColorsController : BaseApiController
{
    private readonly IColorService _colors;
    private readonly IValidator<CreateColorRequest> _createValidator;
    private readonly IValidator<UpdateColorRequest> _updateValidator;

    public ColorsController(
        IColorService colors,
        IValidator<CreateColorRequest> createValidator,
        IValidator<UpdateColorRequest> updateValidator)
    {
        _colors = colors;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _colors.GetAllAsync(ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _colors.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateColorRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _colors.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return CreatedResponse(nameof(GetById), new { id = result.Value!.Id }, result.Value, "Color created successfully");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateColorRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _colors.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value, "Color updated successfully");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _colors.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return DeletedResponse("Color deleted successfully");
    }
}
