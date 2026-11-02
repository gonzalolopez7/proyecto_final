using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.VariantesProveedores.Commands;
using SGCS.Application.Features.VariantesProveedores.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class VarianteProveedorController : ControllerBase
{
    private readonly IMediator _mediator;

    public VarianteProveedorController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateVarianteProveedorCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetVariantesProveedoresQuery query)
    {
        var dtos = await _mediator.Send(query);

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetVarianteProveedorByIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("by-variante/{idVariante}")]
    public async Task<IActionResult> GetByVarianteId([FromRoute] string idVariante)
    {
        var result = await _mediator.Send(new GetProveedoresByVarianteIdQuery(idVariante));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("by-proveedor/{idProveedor}")]
    public async Task<IActionResult> GetByProveedorId([FromRoute] string idProveedor)
    {
        var result = await _mediator.Send(new GetVariantesByProveedorIdQuery(idProveedor));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateVarianteProveedorRequest request)
    {
        var result = await _mediator.Send(new UpdateVarianteProveedorCommand(
            id,
            request.CodigoProveedor,
            request.Costo
        ));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var result = await _mediator.Send(new DeleteVarianteProveedorCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}

