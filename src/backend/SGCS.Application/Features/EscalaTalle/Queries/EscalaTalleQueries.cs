using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.EscalasTalles.Queries;

// --- GET ALL ---
public record GetEscalasTallesQuery : IRequest<Result<IReadOnlyList<EscalaTalleDto>>>;

public class GetEscalasTallesQueryHandler : IRequestHandler<GetEscalasTallesQuery, Result<IReadOnlyList<EscalaTalleDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetEscalasTallesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<EscalaTalleDto>>> Handle(GetEscalasTallesQuery request, CancellationToken cancellationToken)
    {
        var escalas = await _context.EscalasTalles
            .AsNoTracking()
            .OrderBy(e => e.Nombre)
            .Select(e => new EscalaTalleDto(e.Id, e.Nombre))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<EscalaTalleDto>>.Success(escalas);
    }
}

// --- GET BY ID ---
public record GetEscalaTalleByIdQuery(string Id) : IRequest<Result<EscalaTalleDto>>;

public class GetEscalaTalleByIdQueryValidator : AbstractValidator<GetEscalaTalleByIdQuery>
{
    public GetEscalaTalleByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la escala de talle es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la escala de talle no debe superar los 36 caracteres.");
    }
}

public class GetEscalaTalleByIdQueryHandler : IRequestHandler<GetEscalaTalleByIdQuery, Result<EscalaTalleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetEscalaTalleByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<EscalaTalleDto>> Handle(GetEscalaTalleByIdQuery request, CancellationToken cancellationToken)
    {
        var escala = await _context.EscalasTalles
            .AsNoTracking()
            .Where(e => e.Id == request.Id)
            .Select(e => new EscalaTalleDto(e.Id, e.Nombre))
            .FirstOrDefaultAsync(cancellationToken);

        if (escala is null)
            return Result<EscalaTalleDto>.Failure(EscalaTalleErrors.NotFound(request.Id));

        return Result<EscalaTalleDto>.Success(escala);
    }
}

