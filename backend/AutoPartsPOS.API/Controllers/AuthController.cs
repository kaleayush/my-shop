using AutoPartsPOS.Application.Features.Auth.DTOs;
using AutoPartsPOS.Application.Features.Auth.Services;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/auth")]
public class AuthController : BaseApiController
{
    private readonly IAuthService _authService;
    private readonly IValidator<RegisterShopOwnerRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthController(
        IAuthService authService,
        IValidator<RegisterShopOwnerRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _authService = authService;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    [HttpPost("register-shop-owner")]
    public async Task<IActionResult> RegisterShopOwner(
        [FromBody] RegisterShopOwnerRequest request,
        CancellationToken ct)
    {
        var validation = await _registerValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _authService.RegisterShopOwnerAsync(request, ct);
        if (result.IsFailure) return BadRequestResponse(result.Error!);
        return OkResponse(result.Value, "Shop registered successfully");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken ct)
    {
        var validation = await _loginValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
            return ValidationFailedResponse(validation.Errors.Select(e => e.ErrorMessage));

        var result = await _authService.LoginAsync(request, ct);
        if (result.IsFailure) return UnauthorizedResponse(result.Error!);
        return OkResponse(result.Value, "Login successful");
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser(CancellationToken ct)
    {
        var result = await _authService.GetCurrentUserAsync(ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }
}
