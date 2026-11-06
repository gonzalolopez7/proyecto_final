using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Depositos.Commands;
using SGCS.Application.Features.Depositos.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class DepositoController : ControllerBase
{
    private readonly IMediator _mediator;

    public DepositoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateDepositoCommand command)
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
            new RestoreDepositoCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] GetDepositosQuery query)
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
            new GetDepositoByIdQuery(id)
        );

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        [FromRoute] string id,
        [FromBody] UpdateDepositoRequest request)
    {
        var result = await _mediator.Send(
            new UpdateDepositoCommand(
                id,
                request.Nombre,
                request.Descripcion
            )
        );

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> ChangeStatus(
        [FromRoute] string id,
        [FromBody] ChangeDepositoStatusRequest request)
    {
        var result = await _mediator.Send(
            new CambiarEstadoDepositoCommand(
                id,
                request.Activo
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
            new DeleteDepositoCommand(id)
        );

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}