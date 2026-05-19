using AutoPartsPOS.Application.Features.Brands;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[ApiController]
[Route("api/brands")]
[Authorize]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brands;
    private readonly IValidator<CreateBrandRequest> _createValidator;
    private readonly IValidator<UpdateBrandRequest> _updateValidator;

    public BrandsController(
        IBrandService brands,
        IValidator<CreateBrandRequest> createValidator,
        IValidator<UpdateBrandRequest> updateValidator)
    {
        _brands = brands;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _brands.GetAllAsync(ct);
        return Ok(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _brands.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBrandRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _brands.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequest(new { error = result.Error });
        return CreatedAtAction(nameof(GetById), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _brands.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return Ok(result.Value);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _brands.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFound(new { error = result.Error });
        return NoContent();
    }
}
