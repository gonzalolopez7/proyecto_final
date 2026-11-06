using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Ubicaciones.Queries;

public record GetUbicacionesPorVarianteQuery(string IdVariante)
    : IRequest<Result<IReadOnlyList<UbicacionDto>>>;

public class GetUbicacionesPorVarianteQueryValidator
    : AbstractValidator<GetUbicacionesPorVarianteQuery>
{
    public GetUbicacionesPorVarianteQueryValidator()
    {
        RuleFor(x => x.IdVariante)
            .NotEmpty()
            .WithMessage("El ID de la variante es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la variante no debe superar los 36 caracteres.");
    }
}

public class GetUbicacionesPorVarianteQueryHandler
    : IRequestHandler<
        GetUbicacionesPorVarianteQuery,
        Result<IReadOnlyList<UbicacionDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetUbicacionesPorVarianteQueryHandler(
        IApplicationDbContext context)
        => _context = context;

    public async Task<Result<IReadOnlyList<UbicacionDto>>> Handle(
        GetUbicacionesPorVarianteQuery request,
        CancellationToken cancellationToken)
    {
        var varianteExiste = await _context.Variantes
            .AnyAsync(v => v.Id == request.IdVariante, cancellationToken);

        if (!varianteExiste)
            return Result<IReadOnlyList<UbicacionDto>>.Failure(
                UbicacionErrors.VarianteNotFound(request.IdVariante));

        var ubicaciones = await _context.Ubicaciones
            .AsNoTracking()
            .Where(u => u.IdVariante == request.IdVariante)
            .OrderBy(u => u.Estanteria != null && u.Estanteria.Deposito != null ? u.Estanteria.Deposito.Nombre : string.Empty)
            .ThenBy(u => u.Estanteria != null ? u.Estanteria.Nombre : string.Empty)
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
