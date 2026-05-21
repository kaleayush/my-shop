using AutoPartsPOS.Application.Features.PurchaseBills;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/purchase-bills")]
[Authorize]
public class PurchaseBillsController : BaseApiController
{
    private readonly IPurchaseBillService _purchaseBills;
    private readonly IValidator<UploadPurchaseBillRequest> _uploadValidator;
    private readonly IValidator<MapPurchaseBillItemRequest> _mapValidator;
    private readonly IValidator<CreateProductFromPurchaseBillItemRequest> _createProductValidator;
    private readonly IValidator<ConfirmPurchaseBillRequest> _confirmValidator;

    public PurchaseBillsController(
        IPurchaseBillService purchaseBills,
        IValidator<UploadPurchaseBillRequest> uploadValidator,
        IValidator<MapPurchaseBillItemRequest> mapValidator,
        IValidator<CreateProductFromPurchaseBillItemRequest> createProductValidator,
        IValidator<ConfirmPurchaseBillRequest> confirmValidator)
    {
        _purchaseBills = purchaseBills;
        _uploadValidator = uploadValidator;
        _mapValidator = mapValidator;
        _createProductValidator = createProductValidator;
        _confirmValidator = confirmValidator;
    }
    public record UploadFile(IFormFile File);
    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload(
        [FromForm] Guid dealerId,
        [FromForm] string? billNumber,
        [FromForm] DateTime billDate,
        [FromForm] decimal totalAmount,
        [FromForm] decimal paidAmount,
        [FromForm] UploadFile uploadFile,
        CancellationToken ct)
    {
        if (uploadFile.File is null || uploadFile.File.Length == 0)
            return ValidationFailedResponse(["Purchase bill file is required."]);

        await using var stream = uploadFile.File.OpenReadStream();
        var request = new UploadPurchaseBillRequest
        {
            DealerId = dealerId,
            BillNumber = billNumber,
            BillDate = billDate,
            TotalAmount = totalAmount,
            PaidAmount = paidAmount,
            FileName = uploadFile.File.FileName,
            ContentType = uploadFile.File.ContentType,
            FileContent = stream,
        };

        var validation = await _uploadValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _purchaseBills.UploadAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Purchase bill uploaded for review");
    }

    [HttpGet("{id:guid}/review")]
    public async Task<IActionResult> Review(Guid id, CancellationToken ct)
    {
        var result = await _purchaseBills.GetReviewAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }

    [HttpPost("{id:guid}/map-item")]
    public async Task<IActionResult> MapItem(Guid id, [FromBody] MapPurchaseBillItemRequest request, CancellationToken ct)
    {
        var validation = await _mapValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _purchaseBills.MapItemAsync(id, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Purchase bill item mapped successfully");
    }

    [HttpPost("{id:guid}/create-product-from-item")]
    public async Task<IActionResult> CreateProductFromItem(Guid id, [FromBody] CreateProductFromPurchaseBillItemRequest request, CancellationToken ct)
    {
        var validation = await _createProductValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _purchaseBills.CreateProductFromItemAsync(id, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Product created and mapped successfully");
    }

    [HttpPost("{id:guid}/confirm")]
    public async Task<IActionResult> Confirm(Guid id, [FromBody] ConfirmPurchaseBillRequest request, CancellationToken ct)
    {
        var validation = await _confirmValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _purchaseBills.ConfirmAsync(id, request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Purchase bill confirmed successfully");
    }
}
