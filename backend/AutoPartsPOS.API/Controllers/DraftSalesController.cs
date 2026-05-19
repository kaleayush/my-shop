using AutoPartsPOS.Application.Features.Pos;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/draft-sales")]
[Authorize]
public class DraftSalesController : BaseApiController
{
    private readonly IPosService _pos;
    private readonly IValidator<CreateDraftSaleRequest> _createValidator;
    private readonly IValidator<AddDraftSaleItemRequest> _addItemValidator;
    private readonly IValidator<UpdateDraftSaleItemRequest> _updateItemValidator;
    private readonly IValidator<CompleteDraftSaleRequest> _completeValidator;

    public DraftSalesController(
        IPosService pos,
        IValidator<CreateDraftSaleRequest> createValidator,
        IValidator<AddDraftSaleItemRequest> addItemValidator,
        IValidator<UpdateDraftSaleItemRequest> updateItemValidator,
        IValidator<CompleteDraftSaleRequest> completeValidator)
    {
        _pos = pos;
        _createValidator = createValidator;
        _addItemValidator = addItemValidator;
        _updateItemValidator = updateItemValidator;
        _completeValidator = completeValidator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDraftSaleRequest request, CancellationToken ct)
    {
        var validation = await _createValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _pos.CreateDraftAsync(request, ct);
        return OkResponse(result.Value, "Draft bill created successfully");
    }

    [HttpGet("active")]
    public async Task<IActionResult> Active(CancellationToken ct)
    {
        var result = await _pos.GetActiveDraftsAsync(ct);
        return OkResponse(result.Value);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _pos.GetDraftAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost("{id:guid}/items")]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] AddDraftSaleItemRequest request, CancellationToken ct)
    {
        var validation = await _addItemValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _pos.AddItemAsync(id, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Item added and stock reserved");
    }

    [HttpPut("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, Guid itemId, [FromBody] UpdateDraftSaleItemRequest request, CancellationToken ct)
    {
        var validation = await _updateItemValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _pos.UpdateItemAsync(id, itemId, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Draft item updated successfully");
    }

    [HttpDelete("{id:guid}/items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid id, Guid itemId, CancellationToken ct)
    {
        var result = await _pos.RemoveItemAsync(id, itemId, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Item removed and stock released");
    }

    [HttpPost("{id:guid}/hold")]
    public async Task<IActionResult> Hold(Guid id, CancellationToken ct)
    {
        var result = await _pos.HoldAsync(id, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Draft bill held successfully");
    }

    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var result = await _pos.CancelAsync(id, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Draft bill cancelled and stock released");
    }

    [HttpPost("{id:guid}/complete")]
    public async Task<IActionResult> Complete(Guid id, [FromBody] CompleteDraftSaleRequest request, CancellationToken ct)
    {
        var validation = await _completeValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _pos.CompleteAsync(id, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Sale completed successfully");
    }
}
