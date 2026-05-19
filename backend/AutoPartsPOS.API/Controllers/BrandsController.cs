using AutoPartsPOS.Application.Features.Brands;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/brands")]
[Authorize]
public class BrandsController : BaseApiController
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
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _brands.GetByIdAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateBrandRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _brands.CreateAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return CreatedResponse(nameof(GetById), new { id = result.Value!.Id }, result.Value, "Brand created successfully");
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBrandRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _brands.UpdateAsync(id, request, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value, "Brand updated successfully");
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var result = await _brands.DeleteAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return DeletedResponse("Brand deleted successfully");
    }
}
