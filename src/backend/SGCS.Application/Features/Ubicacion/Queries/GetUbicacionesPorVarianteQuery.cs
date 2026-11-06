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
            .MaximumLength(36);
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
            .OrderBy(u => u.Estanteria.Nombre)
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