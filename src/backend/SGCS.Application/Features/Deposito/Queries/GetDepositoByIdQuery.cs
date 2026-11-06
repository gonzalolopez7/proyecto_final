using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos; 

namespace SGCS.Application.Features.Depositos.Queries;

public record GetDepositoByIdQuery(string Id)
    : IRequest<Result<DepositoDto>>;

public class GetDepositoByIdQueryValidator
    : AbstractValidator<GetDepositoByIdQuery>
{
    public GetDepositoByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .MaximumLength(36);
    }
}

public class GetDepositoByIdQueryHandler
    : IRequestHandler<GetDepositoByIdQuery, Result<DepositoDto>>
{
    private readonly IApplicationDbContext _context;

    public GetDepositoByIdQueryHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<DepositoDto>> Handle(
        GetDepositoByIdQuery request,
        CancellationToken cancellationToken)
    {
        var deposito = await _context.Depositos
            .AsNoTracking()
            .Where(d => d.Id == request.Id)
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
            .FirstOrDefaultAsync(cancellationToken);

        if (deposito is null)
            return Result<DepositoDto>.Failure(
                DepositoErrors.NotFound(request.Id));

        return Result<DepositoDto>.Success(deposito);
    }
}