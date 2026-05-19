using AutoPartsPOS.Application.Features.Pos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AutoPartsPOS.API.Controllers;

[Route("api/sales")]
[Authorize]
public class SalesController : BaseApiController
{
    private readonly IPosService _pos;

    public SalesController(IPosService pos) => _pos = pos;

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> Get(Guid id, CancellationToken ct)
    {
        var result = await _pos.GetSaleAsync(id, ct);
        if (result.IsFailure) return NotFoundResponse(result.Error!);
        return OkResponse(result.Value);
    }
}
