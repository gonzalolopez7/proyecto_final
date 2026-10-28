using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Categorias.Queries;

public record GetCategoriasQuery(
    string? IdPadre = null,
    bool SoloPrincipales = false
) : IRequest<Result<IReadOnlyList<CategoriaDto>>>;

public class GetCategoriasQueryValidator : AbstractValidator<GetCategoriasQuery>
{
    public GetCategoriasQueryValidator()
    {
        RuleFor(x => x.IdPadre)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdPadre))
            .WithMessage("El ID de la categoría padre no debe superar los 36 caracteres.");
    }
}

public class GetCategoriasQueryHandler : IRequestHandler<GetCategoriasQuery, Result<IReadOnlyList<CategoriaDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriasQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<CategoriaDto>>> Handle(GetCategoriasQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Categorias.AsNoTracking();

        if (request.SoloPrincipales)
            query = query.Where(c => c.IdPadre == null);
        else if (!string.IsNullOrEmpty(request.IdPadre))
            query = query.Where(c => c.IdPadre == request.IdPadre);

        var categorias = await query
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoriaDto(
                c.Id,
                c.Nombre,
                c.IdPadre,
                c.Padre != null ? c.Padre.Nombre : null
            ))
            .ToListAsync(cancellationToken);

        return Result<IReadOnlyList<CategoriaDto>>.Success(categorias);
    }
}
