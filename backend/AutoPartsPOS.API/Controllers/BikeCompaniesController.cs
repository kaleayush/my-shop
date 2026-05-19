using AutoPartsPOS.Application.Features.BikeCompanies;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[ApiController]
[Route("api/bike-companies")]
[Authorize]
public class BikeCompaniesController : ControllerBase
{
    private readonly IBikeCompanyService _companies;
    private readonly IValidator<CreateBikeCompanyRequest> _createValidator;
    private readonly IValidator<UpdateBikeCompanyRequest> _updateValidator;

    public BikeCompaniesController(
        IBikeCompanyService companies,
        IValidator<CreateBikeCompanyRequest> createValidator,
        IValidator<UpdateBikeCompanyRequest> updateValidator)
    {
        _companies = companies;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _companies.GetAllAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _companies.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBikeCompanyRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _companies.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequest(new { error = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBikeCompanyRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _companies.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _companies.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
