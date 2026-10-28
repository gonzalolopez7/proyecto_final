using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Atributos.Queries;

// --- GET ALL ---
public record GetTemporadasQuery : IRequest<Result<IReadOnlyList<TemporadaDto>>>;

public class GetTemporadasQueryHandler : IRequestHandler<GetTemporadasQuery, Result<IReadOnlyList<TemporadaDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetTemporadasQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<TemporadaDto>>> Handle(GetTemporadasQuery request, CancellationToken cancellationToken)
    {
        var temporadas = await _context.Temporadas
            .AsNoTracking()
            .OrderBy(t => t.Nombre)
            .Select(t => new TemporadaDto(t.Id, t.Nombre))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<TemporadaDto>>.Success(temporadas);
    }
}

// --- GET BY ID ---
public record GetTemporadaByIdQuery(string Id) : IRequest<Result<TemporadaDto>>;

public class GetTemporadaByIdQueryValidator : AbstractValidator<GetTemporadaByIdQuery>
{
    public GetTemporadaByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la temporada es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la temporada no debe superar los 36 caracteres.");
    }
}

public class GetTemporadaByIdQueryHandler : IRequestHandler<GetTemporadaByIdQuery, Result<TemporadaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetTemporadaByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<TemporadaDto>> Handle(GetTemporadaByIdQuery request, CancellationToken cancellationToken)
    {
        var temporada = await _context.Temporadas
            .AsNoTracking()
            .Where(t => t.Id == request.Id)
            .Select(t => new TemporadaDto(t.Id, t.Nombre))
            .FirstOrDefaultAsync(cancellationToken);

        if (temporada is null)
            return Result<TemporadaDto>.Failure(AtributoErrors.TemporadaNotFound(request.Id));

        return Result<TemporadaDto>.Success(temporada);
    }
}
