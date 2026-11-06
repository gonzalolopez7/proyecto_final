using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Estanterias.Queries;

public record GetEstanteriaByIdQuery(string Id)
    : IRequest<Result<EstanteriaDto>>;

public class GetEstanteriaByIdQueryValidator
    : AbstractValidator<GetEstanteriaByIdQuery>
{
    public GetEstanteriaByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la estantería es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la estantería no debe superar los 36 caracteres.");
    }
}

public class GetEstanteriaByIdQueryHandler
    : IRequestHandler<GetEstanteriaByIdQuery, Result<EstanteriaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEstanteriaByIdQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<EstanteriaDto>> Handle(
        GetEstanteriaByIdQuery request,
        CancellationToken cancellationToken)
    {
        var estanteria = await _context.Estanterias
            .AsNoTracking()
            .Where(e => e.Id == request.Id)
            .Select(e => new EstanteriaDto(
                e.Id,
                e.IdDeposito,
                e.Deposito != null ? e.Deposito.Nombre : string.Empty,
                e.Nombre,
                e.Descripcion,
                _context.Ubicaciones.Count(u => u.IdEstanteria == e.Id && u.Cantidad > 0),
                _context.Ubicaciones
                    .Where(u => u.IdEstanteria == e.Id)
                    .Sum(u => (int?)u.Cantidad) ?? 0
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (estanteria is null)
            return Result<EstanteriaDto>.Failure(
                EstanteriaErrors.NotFound(request.Id));

        return Result<EstanteriaDto>.Success(estanteria);
    }
}
