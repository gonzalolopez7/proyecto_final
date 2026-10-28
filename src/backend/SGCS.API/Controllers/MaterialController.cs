using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Atributos.Commands;
using SGCS.Application.Features.Atributos.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class MaterialController : ControllerBase
{
    private readonly IMediator _mediator;

    public MaterialController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateMaterialCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new GetMaterialesQuery());

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetMaterialByIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateMaterialRequest request)
    {
        var result = await _mediator.Send(new UpdateMaterialCommand(id, request.Nombre));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var result = await _mediator.Send(new DeleteMaterialCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}

