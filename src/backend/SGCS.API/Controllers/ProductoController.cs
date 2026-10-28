using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Productos.Commands;
using SGCS.Application.Features.Productos.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class ProductoController : ControllerBase
{
    private readonly IMediator _mediator;

    public ProductoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateProductoCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetProductosQuery query)
    {
        var dtos = await _mediator.Send(query);

        return Ok(dtos);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetProductoByIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("by-name/{nombre}")]
    public async Task<IActionResult> GetByName([FromRoute] string nombre)
    {
        var result = await _mediator.Send(new GetProductoByNameQuery(nombre));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateProductoRequest request)
    {
        var result = await _mediator.Send(new UpdateProductoCommand(
            id,
            request.Nombre,
            request.Descripcion,
            request.IdCategoria,
            request.IdGenero,
            request.IdTemporada,
            request.IdFit,
            request.IdMaterial
        ));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var result = await _mediator.Send(new DeleteProductoCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> Restore([FromRoute] string id)
    {
        var result = await _mediator.Send(new RestoreProductoCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}

