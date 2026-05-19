using AutoPartsPOS.Application.Features.BikeModels;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[ApiController]
[Route("api/bike-models")]
[Authorize]
public class BikeModelsController : ControllerBase
{
    private readonly IBikeModelService _models;
    private readonly IValidator<CreateBikeModelRequest> _createValidator;
    private readonly IValidator<UpdateBikeModelRequest> _updateValidator;

    public BikeModelsController(
        IBikeModelService models,
        IValidator<CreateBikeModelRequest> createValidator,
        IValidator<UpdateBikeModelRequest> updateValidator)
    {
        _models = models;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _models.GetAllAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet("by-company/{bikeCompanyId:guid}")]
    public async Task<IActionResult> GetByCompany(Guid bikeCompanyId, CancellationToken ct)
    {
        var result = await _models.GetByCompanyAsync(bikeCompanyId, ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _models.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBikeModelRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _models.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequest(new { error = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBikeModelRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _models.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _models.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
