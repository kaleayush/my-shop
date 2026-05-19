using AutoPartsPOS.API.Common;
using AutoPartsPOS.Application.Common;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[ApiController]
public abstract class BaseApiController : ControllerBase
{
    protected IActionResult OkResponse<T>(T data, string message = "Success")
        => Ok(ApiResponse<T>.Success(data, message));

    protected IActionResult CreatedResponse<T>(string actionName, object routeValues, T data, string message = "Created successfully")
        => CreatedAtAction(actionName, routeValues, ApiResponse<T>.Success(data, message, 201));

    protected IActionResult DeletedResponse(string message = "Deleted successfully")
        => Ok(ApiResponse<object?>.Success(null, message));

    protected IActionResult NotFoundResponse(string message)
        => NotFound(ApiResponse<object?>.Fail(message, 404));

    protected IActionResult BadRequestResponse(string message)
        => BadRequest(ApiResponse<object?>.Fail(message, 400));

    protected IActionResult ValidationFailedResponse(IEnumerable<string> errors)
    {
        var list = errors.ToList();
        return BadRequest(ApiResponse<object?>.Fail("Validation failed", 400, list));
    }

    protected IActionResult UnauthorizedResponse(string message)
        => Unauthorized(ApiResponse<object?>.Fail(message, 401));

    protected IActionResult PagedOkResponse<T>(PagedResult<T> pagedResult, string message = "Success")
        => Ok(ApiResponse<PagedResponse<T>>.Success(PagedResponse<T>.From(pagedResult), message));
}
