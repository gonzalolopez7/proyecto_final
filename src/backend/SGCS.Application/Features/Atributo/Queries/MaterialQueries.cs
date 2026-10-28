using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Atributos.Queries;

// --- GET ALL ---
public record GetMaterialesQuery : IRequest<Result<IReadOnlyList<MaterialDto>>>;

public class GetMaterialesQueryHandler : IRequestHandler<GetMaterialesQuery, Result<IReadOnlyList<MaterialDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetMaterialesQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<MaterialDto>>> Handle(GetMaterialesQuery request, CancellationToken cancellationToken)
    {
        var materiales = await _context.Materiales
            .AsNoTracking()
            .OrderBy(m => m.Nombre)
            .Select(m => new MaterialDto(m.Id, m.Nombre))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<MaterialDto>>.Success(materiales);
    }
}

// --- GET BY ID ---
public record GetMaterialByIdQuery(string Id) : IRequest<Result<MaterialDto>>;

public class GetMaterialByIdQueryValidator : AbstractValidator<GetMaterialByIdQuery>
{
    public GetMaterialByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del material es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del material no debe superar los 36 caracteres.");
    }
}

public class GetMaterialByIdQueryHandler : IRequestHandler<GetMaterialByIdQuery, Result<MaterialDto>>
{
    private readonly IApplicationDbContext _context;

    public GetMaterialByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<MaterialDto>> Handle(GetMaterialByIdQuery request, CancellationToken cancellationToken)
    {
        var material = await _context.Materiales
            .AsNoTracking()
            .Where(m => m.Id == request.Id)
            .Select(m => new MaterialDto(m.Id, m.Nombre))
            .FirstOrDefaultAsync(cancellationToken);

        if (material is null)
            return Result<MaterialDto>.Failure(AtributoErrors.MaterialNotFound(request.Id));

        return Result<MaterialDto>.Success(material);
    }
}
