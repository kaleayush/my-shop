using FluentValidation;

namespace AutoPartsPOS.Application.Features.Dealers;

public class CreateDealerRequestValidator : AbstractValidator<CreateDealerRequest>
{
    public CreateDealerRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.Address).MaximumLength(300);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}

public class UpdateDealerRequestValidator : AbstractValidator<UpdateDealerRequest>
{
    public UpdateDealerRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).MaximumLength(20);
        RuleFor(x => x.Address).MaximumLength(300);
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}
