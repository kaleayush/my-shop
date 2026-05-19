using FluentValidation;

namespace AutoPartsPOS.Application.Features.Colors;

public class CreateColorRequestValidator : AbstractValidator<CreateColorRequest>
{
    public CreateColorRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class UpdateColorRequestValidator : AbstractValidator<UpdateColorRequest>
{
    public UpdateColorRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
