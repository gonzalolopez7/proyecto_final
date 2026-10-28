using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Atributos.Queries;

// --- GET ALL ---
public record GetGenerosQuery : IRequest<Result<IReadOnlyList<GeneroDto>>>;

public class GetGenerosQueryHandler : IRequestHandler<GetGenerosQuery, Result<IReadOnlyList<GeneroDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetGenerosQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<GeneroDto>>> Handle(GetGenerosQuery request, CancellationToken cancellationToken)
    {
        var generos = await _context.Generos
            .AsNoTracking()
            .OrderBy(g => g.Nombre)
            .Select(g => new GeneroDto(g.Id, g.Nombre))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<GeneroDto>>.Success(generos);
    }
}

// --- GET BY ID ---
public record GetGeneroByIdQuery(string Id) : IRequest<Result<GeneroDto>>;

public class GetGeneroByIdQueryValidator : AbstractValidator<GetGeneroByIdQuery>
{
    public GetGeneroByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del género es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del género no debe superar los 36 caracteres.");
    }
}

public class GetGeneroByIdQueryHandler : IRequestHandler<GetGeneroByIdQuery, Result<GeneroDto>>
{
    private readonly IApplicationDbContext _context;

    public GetGeneroByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<GeneroDto>> Handle(GetGeneroByIdQuery request, CancellationToken cancellationToken)
    {
        var genero = await _context.Generos
            .AsNoTracking()
            .Where(g => g.Id == request.Id)
            .Select(g => new GeneroDto(g.Id, g.Nombre))
            .FirstOrDefaultAsync(cancellationToken);

        if (genero is null)
            return Result<GeneroDto>.Failure(AtributoErrors.GeneroNotFound(request.Id));

        return Result<GeneroDto>.Success(genero);
    }
}
