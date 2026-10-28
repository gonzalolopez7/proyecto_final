using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Atributos.Queries;

// --- GET ALL ---
public record GetFitsQuery : IRequest<Result<IReadOnlyList<FitDto>>>;

public class GetFitsQueryHandler : IRequestHandler<GetFitsQuery, Result<IReadOnlyList<FitDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetFitsQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<FitDto>>> Handle(GetFitsQuery request, CancellationToken cancellationToken)
    {
        var fits = await _context.Fits
            .AsNoTracking()
            .OrderBy(f => f.Nombre)
            .Select(f => new FitDto(f.Id, f.Nombre))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<FitDto>>.Success(fits);
    }
}

// --- GET BY ID ---
public record GetFitByIdQuery(string Id) : IRequest<Result<FitDto>>;

public class GetFitByIdQueryValidator : AbstractValidator<GetFitByIdQuery>
{
    public GetFitByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del fit es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del fit no debe superar los 36 caracteres.");
    }
}

public class GetFitByIdQueryHandler : IRequestHandler<GetFitByIdQuery, Result<FitDto>>
{
    private readonly IApplicationDbContext _context;

    public GetFitByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<FitDto>> Handle(GetFitByIdQuery request, CancellationToken cancellationToken)
    {
        var fit = await _context.Fits
            .AsNoTracking()
            .Where(f => f.Id == request.Id)
            .Select(f => new FitDto(f.Id, f.Nombre))
            .FirstOrDefaultAsync(cancellationToken);

        if (fit is null)
            return Result<FitDto>.Failure(AtributoErrors.FitNotFound(request.Id));

        return Result<FitDto>.Success(fit);
    }
}
