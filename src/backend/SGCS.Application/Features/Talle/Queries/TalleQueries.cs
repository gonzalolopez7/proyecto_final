using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Talles.Queries;

// --- GET BY ID ---
public record GetTalleByIdQuery(string Id) : IRequest<Result<TalleDto>>;

public class GetTalleByIdQueryValidator : AbstractValidator<GetTalleByIdQuery>
{
    public GetTalleByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del talle es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del talle no debe superar los 36 caracteres.");
    }
}

public class GetTalleByIdQueryHandler : IRequestHandler<GetTalleByIdQuery, Result<TalleDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTalleByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<TalleDto>> Handle(GetTalleByIdQuery request, CancellationToken cancellationToken)
    {
        var talle = await _context.Talles
            .AsNoTracking()
            .Where(t => t.Id == request.Id)
            .Select(t => new TalleDto(
                t.Id,
                t.IdEscalaTalle,
                t.EscalaTalle != null ? t.EscalaTalle.Nombre : null,
                t.Nombre,
                t.Orden
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (talle is null)
            return Result<TalleDto>.Failure(TalleErrors.NotFound(request.Id));

        return Result<TalleDto>.Success(talle);
    }
}

// --- GET BY ESCALA ID ---
public record GetTallesByEscalaIdQuery(string IdEscalaTalle) : IRequest<Result<IReadOnlyList<TalleDto>>>;

public class GetTallesByEscalaIdQueryValidator : AbstractValidator<GetTallesByEscalaIdQuery>
{
    public GetTallesByEscalaIdQueryValidator()
    {
        RuleFor(x => x.IdEscalaTalle)
            .NotEmpty()
            .WithMessage("El ID de la escala de talle es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la escala de talle no debe superar los 36 caracteres.");
    }
}

public class GetTallesByEscalaIdQueryHandler : IRequestHandler<GetTallesByEscalaIdQuery, Result<IReadOnlyList<TalleDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTallesByEscalaIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<TalleDto>>> Handle(GetTallesByEscalaIdQuery request, CancellationToken cancellationToken)
    {
        var escalaExists = await _context.EscalasTalles
            .AnyAsync(e => e.Id == request.IdEscalaTalle, cancellationToken);

        if (!escalaExists)
            return Result<IReadOnlyList<TalleDto>>.Failure(TalleErrors.EscalaTalleNotFound(request.IdEscalaTalle));

        var talles = await _context.Talles
            .AsNoTracking()
            .Where(t => t.IdEscalaTalle == request.IdEscalaTalle)
            .OrderBy(t => t.Orden)
            .ThenBy(t => t.Nombre)
            .Select(t => new TalleDto(
                t.Id,
                t.IdEscalaTalle,
                t.EscalaTalle != null ? t.EscalaTalle.Nombre : null,
                t.Nombre,
                t.Orden
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<TalleDto>>.Success(talles);
    }
}
