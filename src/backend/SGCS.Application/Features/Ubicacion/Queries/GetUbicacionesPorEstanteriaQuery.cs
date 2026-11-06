using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Ubicaciones.Queries;

public record GetUbicacionesPorEstanteriaQuery(string IdEstanteria)
    : IRequest<Result<IReadOnlyList<UbicacionDto>>>;

public class GetUbicacionesPorEstanteriaQueryValidator
    : AbstractValidator<GetUbicacionesPorEstanteriaQuery>
{
    public GetUbicacionesPorEstanteriaQueryValidator()
    {
        RuleFor(x => x.IdEstanteria)
            .NotEmpty()
            .MaximumLength(36);
    }
}

public class GetUbicacionesPorEstanteriaQueryHandler
    : IRequestHandler<
        GetUbicacionesPorEstanteriaQuery,
        Result<IReadOnlyList<UbicacionDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUbicacionesPorEstanteriaQueryHandler(
        IApplicationDbContext context)
        => _context = context;

    public async Task<Result<IReadOnlyList<UbicacionDto>>> Handle(
        GetUbicacionesPorEstanteriaQuery request,
        CancellationToken cancellationToken)
    {
        var estanteriaExiste = await _context.Estanterias
            .AnyAsync(e => e.Id == request.IdEstanteria, cancellationToken);

        if (!estanteriaExiste)
            return Result<IReadOnlyList<UbicacionDto>>.Failure(
                UbicacionErrors.EstanteriaNotFound(request.IdEstanteria));

        var ubicaciones = await _context.Ubicaciones
            .AsNoTracking()
            .Where(u => u.IdEstanteria == request.IdEstanteria)
            .OrderBy(u => u.Variante.Sku)
            .Select(u => new UbicacionDto(
                u.Id,
                u.IdVariante,
                u.Variante.Sku,
                u.IdEstanteria,
                u.Estanteria.Nombre,
                u.Estanteria.IdDeposito,
                u.Estanteria.Deposito.Nombre,
                u.Cantidad
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<UbicacionDto>>.Success(ubicaciones);
    }
}