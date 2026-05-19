using FluentValidation;

namespace AutoPartsPOS.Application.Features.Inventory;

public class CreateInventoryBatchRequestValidator : AbstractValidator<CreateInventoryBatchRequest>
{
    public CreateInventoryBatchRequestValidator()
    {
        RuleFor(x => x.ProductId).NotEmpty();
        RuleFor(x => x.DealerId).NotEmpty();
        RuleFor(x => x.BatchNumber).MaximumLength(100);
        RuleFor(x => x.MRP).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Quantity).GreaterThan(0);
        RuleFor(x => x.MinimumStockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class UpdateInventoryBatchRequestValidator : AbstractValidator<UpdateInventoryBatchRequest>
{
    public UpdateInventoryBatchRequestValidator()
    {
        RuleFor(x => x.BatchNumber).NotEmpty().MaximumLength(100);
        RuleFor(x => x.MRP).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PurchasePrice).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CurrentQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ReservedQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.SoldQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DamagedQuantity).GreaterThanOrEqualTo(0);
        RuleFor(x => x.MinimumStockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class AdjustInventoryRequestValidator : AbstractValidator<AdjustInventoryRequest>
{
    public AdjustInventoryRequestValidator()
    {
        RuleFor(x => x.InventoryBatchId).NotEmpty();
        RuleFor(x => x.QuantityDelta).NotEqual(0);
        RuleFor(x => x.Reason).MaximumLength(300);
    }
}
