using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Variantes.Commands;
using SGCS.Application.Features.Variantes.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class VarianteController : ControllerBase
{
    private readonly IMediator _mediator;

    public VarianteController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVarianteCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetVariantesQuery query)
    {
        var dtos = await _mediator.Send(query);

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetVarianteByIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("by-producto/{idProducto}")]
    public async Task<IActionResult> GetByProductoId([FromRoute] string idProducto)
    {
        var result = await _mediator.Send(new GetVariantesByProductoIdQuery(idProducto));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateVarianteRequest request)
    {
        var result = await _mediator.Send(new UpdateVarianteCommand(
            id,
            request.Sku,
            request.IdTalle,
            request.IdColor,
            request.StockMinimo
        ));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var result = await _mediator.Send(new DeleteVarianteCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> Restore([FromRoute] string id)
    {
        var result = await _mediator.Send(new RestoreVarianteCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}

