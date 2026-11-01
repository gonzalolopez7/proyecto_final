using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.EscalasTalles.Queries;
using SGCS.Application.Features.Talles.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/escala-talle")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class EscalaTalleController : ControllerBase
{
    private readonly IMediator _mediator;

    public EscalaTalleController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new GetEscalasTallesQuery());

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetEscalaTalleByIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("{id}/talles")]
    public async Task<IActionResult> GetTallesByEscalaId([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetTallesByEscalaIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }
}

