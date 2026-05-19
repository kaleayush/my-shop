using FluentValidation;

namespace AutoPartsPOS.Application.Features.BikeCompanies;

public class CreateBikeCompanyRequestValidator : AbstractValidator<CreateBikeCompanyRequest>
{
    public CreateBikeCompanyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}

public class UpdateBikeCompanyRequestValidator : AbstractValidator<UpdateBikeCompanyRequest>
{
    public UpdateBikeCompanyRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(100);
    }
}
