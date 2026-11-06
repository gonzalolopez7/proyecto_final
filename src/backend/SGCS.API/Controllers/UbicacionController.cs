using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Ubicaciones.Commands;
using SGCS.Application.Features.Ubicaciones.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class UbicacionController : ControllerBase
{
    private readonly IMediator _mediator;

    public UbicacionController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateUbicacionCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? CreatedAtAction(
                nameof(GetById),
                new { id = result.Value },
                result.Value
            )
            : this.ToProblemDetails(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        [FromRoute] string id)
    {
        var result = await _mediator.Send(
            new GetUbicacionByIdQuery(id)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("by-variante/{idVariante}")]
    public async Task<IActionResult> GetByVarianteId(
        [FromRoute] string idVariante)
    {
        var result = await _mediator.Send(
            new GetUbicacionesPorVarianteQuery(idVariante)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("by-estanteria/{idEstanteria}")]
    public async Task<IActionResult> GetByEstanteriaId(
        [FromRoute] string idEstanteria)
    {
        var result = await _mediator.Send(
            new GetUbicacionesPorEstanteriaQuery(idEstanteria)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] UpdateUbicacionRequest request)
    {
        var result = await _mediator.Send(
            new UpdateUbicacionCommand(
                id,
                request.Cantidad
            )
        );

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(
        [FromRoute] string id)
    {
        var result = await _mediator.Send(
            new DeleteUbicacionCommand(id)
        );

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}
