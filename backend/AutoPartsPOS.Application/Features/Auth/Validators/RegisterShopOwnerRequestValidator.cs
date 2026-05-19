using AutoPartsPOS.Application.Features.Auth.DTOs;
using FluentValidation;

namespace AutoPartsPOS.Application.Features.Auth.Validators;

public class RegisterShopOwnerRequestValidator : AbstractValidator<RegisterShopOwnerRequest>
{
    public RegisterShopOwnerRequestValidator()
    {
        RuleFor(x => x.ShopName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.OwnerName).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(100);
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6).MaximumLength(100);
    }
}
