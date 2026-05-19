using FluentValidation;

namespace AutoPartsPOS.Application.Features.BikeModels;

public class CreateBikeModelRequestValidator : AbstractValidator<CreateBikeModelRequest>
{
    public CreateBikeModelRequestValidator()
    {
        RuleFor(x => x.BikeCompanyId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class UpdateBikeModelRequestValidator : AbstractValidator<UpdateBikeModelRequest>
{
    public UpdateBikeModelRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
