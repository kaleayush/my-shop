using AutoPartsPOS.Application.Features.Dealers;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[ApiController]
[Route("api/dealers")]
[Authorize]
public class DealersController : ControllerBase
{
    private readonly IDealerService _dealers;
    private readonly IValidator<CreateDealerRequest> _createValidator;
    private readonly IValidator<UpdateDealerRequest> _updateValidator;

    public DealersController(
        IDealerService dealers,
        IValidator<CreateDealerRequest> createValidator,
        IValidator<UpdateDealerRequest> updateValidator)
    {
        _dealers = dealers;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _dealers.GetAllAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _dealers.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDealerRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _dealers.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequest(new { error = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateDealerRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _dealers.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _dealers.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
