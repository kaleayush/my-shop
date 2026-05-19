using FluentValidation;

namespace AutoPartsPOS.Application.Features.Graphics;

public class CreateGraphicRequestValidator : AbstractValidator<CreateGraphicRequest>
{
    public CreateGraphicRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class UpdateGraphicRequestValidator : AbstractValidator<UpdateGraphicRequest>
{
    public UpdateGraphicRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
