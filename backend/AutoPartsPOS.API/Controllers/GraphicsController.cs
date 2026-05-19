using AutoPartsPOS.Application.Features.Graphics;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[ApiController]
[Route("api/graphics")]
[Authorize]
public class GraphicsController : ControllerBase
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
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _graphics.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateGraphicRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _graphics.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequest(new { error = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGraphicRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _graphics.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _graphics.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
