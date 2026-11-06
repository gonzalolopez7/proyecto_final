using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Estanterias.Queries;

public record GetEstanteriasQuery(
    string? IdDeposito = null,
    bool IncluirDepositosInactivos = false
) : IRequest<Result<IReadOnlyList<EstanteriaDto>>>;

public class GetEstanteriasQueryValidator
    : AbstractValidator<GetEstanteriasQuery>
{
    public GetEstanteriasQueryValidator()
    {
        RuleFor(x => x.IdDeposito)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdDeposito));
    }
}

public class GetEstanteriasQueryHandler
    : IRequestHandler<GetEstanteriasQuery, Result<IReadOnlyList<EstanteriaDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetEstanteriasQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<IReadOnlyList<EstanteriaDto>>> Handle(
        GetEstanteriasQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Estanterias.AsNoTracking();

        if (!string.IsNullOrEmpty(request.IdDeposito))
            query = query.Where(e => e.IdDeposito == request.IdDeposito);

        if (!request.IncluirDepositosInactivos)
            query = query.Where(e => e.Deposito.Activo);

        var estanterias = await query
            .OrderBy(e => e.Nombre)
            .Select(e => new EstanteriaDto(
                e.Id,
                e.IdDeposito,
                e.Deposito.Nombre,
                e.Nombre,
                e.Descripcion,
                e.Ubicaciones.Count,
                e.Ubicaciones.Sum(u => (int?)u.Cantidad) ?? 0
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<EstanteriaDto>>.Success(estanterias);
    }
}