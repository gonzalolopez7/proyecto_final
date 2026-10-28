using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Categorias.Queries;

public record GetCategoriasTreeQuery : IRequest<Result<IReadOnlyList<CategoriaTreeDto>>>;

public class GetCategoriasTreeQueryHandler : IRequestHandler<GetCategoriasTreeQuery, Result<IReadOnlyList<CategoriaTreeDto>>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriasTreeQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<IReadOnlyList<CategoriaTreeDto>>> Handle(GetCategoriasTreeQuery request, CancellationToken cancellationToken)
    {
        var allCategorias = await _context.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Nombre)
            .ToListAsync(cancellationToken);

        var lookup = allCategorias.ToLookup(c => c.IdPadre);

        List<CategoriaTreeDto> BuildTree(string? parentId)
        {
            return lookup[parentId]
                .Select(c => new CategoriaTreeDto(
                    c.Id,
                    c.Nombre,
                    c.IdPadre,
                    BuildTree(c.Id)
                ))
                .ToList();
        }

        var tree = BuildTree(null);

        return Result<IReadOnlyList<CategoriaTreeDto>>.Success(tree);
    }
}
