using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos; 

namespace SGCS.Application.Features.Depositos.Queries;

public record GetDepositosQuery(
    bool? Activo = null
) : IRequest<Result<IReadOnlyList<DepositoDto>>>;

public class GetDepositosQueryValidator : AbstractValidator<GetDepositosQuery>
{
}

public class GetDepositosQueryHandler
    : IRequestHandler<GetDepositosQuery, Result<IReadOnlyList<DepositoDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetDepositosQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<IReadOnlyList<DepositoDto>>> Handle(
        GetDepositosQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Depositos.AsNoTracking();

        if (request.Activo.HasValue)
            query = query.Where(d => d.Activo == request.Activo.Value);

        var depositos = await query
            .OrderBy(d => d.Nombre)
            .Select(d => new DepositoDto(
                d.Id,
                d.Nombre,
                d.Descripcion,
                d.Activo,
                d.Estanterias.Count,
                d.Estanterias
                    .SelectMany(e => e.Ubicaciones)
                    .Sum(u => (int?)u.Cantidad) ?? 0
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<DepositoDto>>.Success(depositos);
    }
}