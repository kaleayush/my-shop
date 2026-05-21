using FluentValidation;

namespace AutoPartsPOS.Application.Features.PurchaseBills;

public class UploadPurchaseBillRequestValidator : AbstractValidator<UploadPurchaseBillRequest>
{
    public UploadPurchaseBillRequestValidator()
    {
        RuleFor(x => x.DealerId).NotEmpty();
        RuleFor(x => x.BillNumber).MaximumLength(100);
        RuleFor(x => x.FileName).NotEmpty().MaximumLength(255);
        RuleFor(x => x.FileContent).NotNull();
        RuleFor(x => x.TotalAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x).Must(x => x.PaidAmount <= x.TotalAmount || x.TotalAmount == 0)
            .WithMessage("Paid amount cannot exceed total amount.");
    }
}

public class MapPurchaseBillItemRequestValidator : AbstractValidator<MapPurchaseBillItemRequest>
{
    public MapPurchaseBillItemRequestValidator()
    {
        RuleFor(x => x.PurchaseBillItemId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
    }
}

public class CreateProductFromPurchaseBillItemRequestValidator : AbstractValidator<CreateProductFromPurchaseBillItemRequest>
{
    public CreateProductFromPurchaseBillItemRequestValidator()
    {
        RuleFor(x => x.PurchaseBillItemId).NotEmpty();
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MinimumStockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class ConfirmPurchaseBillRequestValidator : AbstractValidator<ConfirmPurchaseBillRequest>
{
    public ConfirmPurchaseBillRequestValidator()
    {
        RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).SetValidator(new ConfirmPurchaseBillItemRequestValidator());
    }
}

public class ConfirmPurchaseBillItemRequestValidator : AbstractValidator<ConfirmPurchaseBillItemRequest>
{
    public ConfirmPurchaseBillItemRequestValidator()
    {
        RuleFor(x => x.PurchaseBillItemId).NotEmpty();
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.RawProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.MRP).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
    }
}
