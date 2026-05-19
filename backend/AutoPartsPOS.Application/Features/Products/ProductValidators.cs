using FluentValidation;

namespace AutoPartsPOS.Application.Features.Products;

public class CreateProductRequestValidator : AbstractValidator<CreateProductRequest>
{
    public CreateProductRequestValidator()
    {
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MRP).GreaterThanOrEqualTo(0);
        RuleFor(x => x.HindiName).MaximumLength(200);
        RuleFor(x => x.SearchKeywords).MaximumLength(500);
        RuleFor(x => x.Barcode).MaximumLength(100);
        RuleFor(x => x.QRCode).MaximumLength(200);
        RuleFor(x => x.MinimumStockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.ProductName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.MRP).GreaterThanOrEqualTo(0);
        RuleFor(x => x.HindiName).MaximumLength(200);
        RuleFor(x => x.SearchKeywords).MaximumLength(500);
        RuleFor(x => x.Barcode).MaximumLength(100);
        RuleFor(x => x.QRCode).MaximumLength(200);
        RuleFor(x => x.MinimumStockQuantity).GreaterThanOrEqualTo(0);
    }
}

public class AddProductImageRequestValidator : AbstractValidator<AddProductImageRequest>
{
    public AddProductImageRequestValidator()
    {
        RuleFor(x => x.ImageUrl).NotEmpty().MaximumLength(1000);
    }
}
