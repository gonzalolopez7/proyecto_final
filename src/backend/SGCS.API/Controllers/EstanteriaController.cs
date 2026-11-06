using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Estanterias.Commands;
using SGCS.Application.Features.Estanterias.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class EstanteriaController : ControllerBase
{
    private readonly IMediator _mediator;

    public EstanteriaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateEstanteriaCommand command)
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
    [HttpPost("{id}/restore")]
    public async Task<IActionResult> Restore(
    [FromRoute] string id)
    {
        var result = await _mediator.Send(
            new RestoreEstanteriaCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] GetEstanteriasQuery query)
    {
        var result = await _mediator.Send(query);

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        [FromRoute] string id)
    {
        var result = await _mediator.Send(
            new GetEstanteriaByIdQuery(id)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] UpdateEstanteriaRequest request)
    {
        var result = await _mediator.Send(
            new UpdateEstanteriaCommand(
                id,
                request.Nombre,
                request.Descripcion
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
            new DeleteEstanteriaCommand(id)
        );

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}