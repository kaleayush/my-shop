using FluentValidation;

namespace AutoPartsPOS.Application.Features.Pos;

public class CreateDraftSaleRequestValidator : AbstractValidator<CreateDraftSaleRequest>
{
    public CreateDraftSaleRequestValidator()
    {
        RuleFor(x => x.CustomerName).MaximumLength(100);
        RuleFor(x => x.CustomerPhone).MaximumLength(20);
    }
}

public class AddDraftSaleItemRequestValidator : AbstractValidator<AddDraftSaleItemRequest>
{
    public AddDraftSaleItemRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.InventoryBatchId).NotEmpty();
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0);
    }
}

public class UpdateDraftSaleItemRequestValidator : AbstractValidator<UpdateDraftSaleItemRequest>
{
    public UpdateDraftSaleItemRequestValidator()
    {
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.SellingPrice).GreaterThanOrEqualTo(0);
    }
}

public class CompleteDraftSaleRequestValidator : AbstractValidator<CompleteDraftSaleRequest>
{
    public CompleteDraftSaleRequestValidator()
    {
        RuleFor(x => x.PaidAmount).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PaymentMode).IsInEnum();
        RuleFor(x => x.Notes).MaximumLength(300);
        RuleFor(x => x.CustomerName).MaximumLength(100);
        RuleFor(x => x.CustomerPhone).MaximumLength(20);
    }
}
