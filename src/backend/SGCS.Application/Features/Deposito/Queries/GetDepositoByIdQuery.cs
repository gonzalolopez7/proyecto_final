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
            .WithMessage("El ID del depósito es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del depósito no debe superar los 36 caracteres.");
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
                _context.Estanterias.Count(e => e.IdDeposito == d.Id),
                _context.Ubicaciones
                    .Where(u => u.Estanteria != null && u.Estanteria.IdDeposito == d.Id)
                    .Sum(u => (int?)u.Cantidad) ?? 0
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (deposito is null)
            return Result<DepositoDto>.Failure(
                DepositoErrors.NotFound(request.Id));

        return Result<DepositoDto>.Success(deposito);
    }
}
