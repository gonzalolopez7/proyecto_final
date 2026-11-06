using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Depositos.Queries;

public record GetDepositosQuery : IRequest<Result<IReadOnlyList<DepositoDto>>>;

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
        var depositos = await _context.Depositos
            .AsNoTracking()
            .OrderBy(d => d.Nombre)
            .Select(d => new DepositoDto(
                d.Id,
                d.Nombre,
                d.Descripcion,
                _context.Estanterias.Count(e => e.IdDeposito == d.Id),
                _context.Ubicaciones
                    .Where(u => u.Estanteria != null && u.Estanteria.IdDeposito == d.Id)
                    .Sum(u => (int?)u.Cantidad) ?? 0
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<DepositoDto>>.Success(depositos);
    }
}
