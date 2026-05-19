using AutoPartsPOS.Application.Features.BikeModels;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/bike-models")]
[Authorize]
public class BikeModelsController : BaseApiController
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
        return OkResponse(result.Value);
    }

    [HttpGet("by-company/{bikeCompanyId:guid}")]
    public async Task<IActionResult> GetByCompany(Guid bikeCompanyId, CancellationToken ct)
    {
        var result = await _models.GetByCompanyAsync(bikeCompanyId, ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _models.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBikeModelRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _models.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return CreatedResponse(nameof(GetById), new { id = result.Value!.Id }, result.Value, "Bike model created successfully");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBikeModelRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _models.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value, "Bike model updated successfully");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _models.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return DeletedResponse("Bike model deleted successfully");
    }
}
