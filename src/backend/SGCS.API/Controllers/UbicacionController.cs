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

    [HttpGet("variante/{idVariante}")]
    public async Task<IActionResult> GetByVariante(
        [FromRoute] string idVariante)
    {
        var result = await _mediator.Send(
            new GetUbicacionesPorVarianteQuery(idVariante)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("estanteria/{idEstanteria}")]
    public async Task<IActionResult> GetByEstanteria(
        [FromRoute] string idEstanteria)
    {
        var result = await _mediator.Send(
            new GetUbicacionesPorEstanteriaQuery(idEstanteria)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPost]
    public async Task<IActionResult> Assign(
        [FromBody] AsignarUbicacionCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }
}