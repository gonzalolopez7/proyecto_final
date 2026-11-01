using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Colores.Queries;

// --- GET ALL ---
public record GetColoresQuery : IRequest<Result<IReadOnlyList<ColorDto>>>;

public class GetColoresQueryHandler : IRequestHandler<GetColoresQuery, Result<IReadOnlyList<ColorDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetColoresQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<ColorDto>>> Handle(GetColoresQuery request, CancellationToken cancellationToken)
    {
        var colores = await _context.Colores
            .AsNoTracking()
            .OrderBy(c => c.Nombre)
            .Select(c => new ColorDto(c.Id, c.Nombre, c.CodigoHex, c.Codigo))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<ColorDto>>.Success(colores);
    }
}

// --- GET BY ID ---
public record GetColorByIdQuery(string Id) : IRequest<Result<ColorDto>>;

public class GetColorByIdQueryValidator : AbstractValidator<GetColorByIdQuery>
{
    public GetColorByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del color es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del color no debe superar los 36 caracteres.");
    }
}

public class GetColorByIdQueryHandler : IRequestHandler<GetColorByIdQuery, Result<ColorDto>>
{
    private readonly IApplicationDbContext _context;

    public GetColorByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ColorDto>> Handle(GetColorByIdQuery request, CancellationToken cancellationToken)
    {
        var color = await _context.Colores
            .AsNoTracking()
            .Where(c => c.Id == request.Id)
            .Select(c => new ColorDto(c.Id, c.Nombre, c.CodigoHex, c.Codigo))
            .FirstOrDefaultAsync(cancellationToken);

        if (color is null)
            return Result<ColorDto>.Failure(ColorErrors.NotFound(request.Id));

        return Result<ColorDto>.Success(color);
    }
}

