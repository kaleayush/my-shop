using AutoPartsPOS.Application.Features.Graphics;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/graphics")]
[Authorize]
public class GraphicsController : BaseApiController
{
    private readonly IGraphicService _graphics;
    private readonly IValidator<CreateGraphicRequest> _createValidator;
    private readonly IValidator<UpdateGraphicRequest> _updateValidator;

    public GraphicsController(
        IGraphicService graphics,
        IValidator<CreateGraphicRequest> createValidator,
        IValidator<UpdateGraphicRequest> updateValidator)
    {
        _graphics = graphics;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _graphics.GetAllAsync(ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _graphics.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGraphicRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _graphics.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return CreatedResponse(nameof(GetById), new { id = result.Value!.Id }, result.Value, "Graphic created successfully");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGraphicRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _graphics.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value, "Graphic updated successfully");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _graphics.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return DeletedResponse("Graphic deleted successfully");
    }
}
