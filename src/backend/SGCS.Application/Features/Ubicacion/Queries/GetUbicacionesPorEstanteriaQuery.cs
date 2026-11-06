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
            .WithMessage("El ID de la estantería es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la estantería no debe superar los 36 caracteres.");
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
            .OrderBy(u => u.Variante != null && u.Variante.Producto != null ? u.Variante.Producto.Nombre : string.Empty)
            .ThenBy(u => u.Variante != null && u.Variante.Talle != null ? u.Variante.Talle.Orden : 0)
            .ThenBy(u => u.Variante != null && u.Variante.Color != null ? u.Variante.Color.Nombre : string.Empty)
            .Select(u => new UbicacionDto(
                u.Id,
                u.IdVariante,
                u.Variante != null ? u.Variante.Sku : string.Empty,
                u.Variante != null && u.Variante.Producto != null ? u.Variante.Producto.Nombre : null,
                u.Variante != null && u.Variante.Talle != null ? u.Variante.Talle.Nombre : null,
                u.Variante != null && u.Variante.Color != null ? u.Variante.Color.Nombre : null,
                u.Variante != null && u.Variante.Color != null ? u.Variante.Color.CodigoHex : null,
                u.IdEstanteria,
                u.Estanteria != null ? u.Estanteria.Nombre : string.Empty,
                u.Estanteria != null ? u.Estanteria.IdDeposito : string.Empty,
                u.Estanteria != null && u.Estanteria.Deposito != null ? u.Estanteria.Deposito.Nombre : string.Empty,
                u.Cantidad
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<UbicacionDto>>.Success(ubicaciones);
    }
}
