using AutoPartsPOS.Application.Features.Inventory;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/inventory")]
[Authorize]
public class InventoryController : BaseApiController
{
    private readonly IInventoryService _inventory;
    private readonly IValidator<CreateInventoryBatchRequest> _createValidator;
    private readonly IValidator<UpdateInventoryBatchRequest> _updateValidator;
    private readonly IValidator<AdjustInventoryRequest> _adjustValidator;

    public InventoryController(
        IInventoryService inventory,
        IValidator<CreateInventoryBatchRequest> createValidator,
        IValidator<UpdateInventoryBatchRequest> updateValidator,
        IValidator<AdjustInventoryRequest> adjustValidator)
    {
        _inventory = inventory;
        _createValidator = createValidator;
        _updateValidator = updateValidator;
        _adjustValidator = adjustValidator;
    }

    [HttpGet("batches")]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _inventory.GetAllAsync(ct);
        return OkResponse(result.Value);
    }

    [HttpGet("batches/{productId:guid}")]
    public async Task<IActionResult> GetByProduct(Guid productId, CancellationToken ct)
    {
        var result = await _inventory.GetByProductAsync(productId, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost("batches")]
    public async Task<IActionResult> CreateBatch([FromBody] CreateInventoryBatchRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _inventory.CreateBatchAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Inventory batch created successfully");
    }

    [HttpPut("batches/{id:guid}")]
    public async Task<IActionResult> UpdateBatch(Guid id, [FromBody] UpdateInventoryBatchRequest request, CancellationToken ct)
    {
        var validation = await _updateValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _inventory.UpdateBatchAsync(id, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Inventory batch updated successfully");
    }

    [HttpPost("adjust")]
    public async Task<IActionResult> Adjust([FromBody] AdjustInventoryRequest request, CancellationToken ct)
    {
        var validation = await _adjustValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _inventory.AdjustAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Inventory adjusted successfully");
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> LowStock(CancellationToken ct)
    {
        var result = await _inventory.GetLowStockAsync(ct);
        return OkResponse(result.Value);
    }

    [HttpGet("reorder/dealer-wise")]
    public async Task<IActionResult> DealerWiseReorder(CancellationToken ct)
    {
        var result = await _inventory.GetLowStockAsync(ct);
        return OkResponse(result.Value);
    }
}
