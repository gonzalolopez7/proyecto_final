using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Productos.Queries;

public record GetProductoByIdQuery(string Id) : IRequest<Result<ProductoDto>>;

public class GetProductoByIdQueryValidator : AbstractValidator<GetProductoByIdQuery>
{
    public GetProductoByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del producto es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del producto no debe superar los 36 caracteres.");
    }
}

public class GetProductoByIdQueryHandler : IRequestHandler<GetProductoByIdQuery, Result<ProductoDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductoByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProductoDto>> Handle(GetProductoByIdQuery request, CancellationToken cancellationToken)
    {
        var producto = await _context.Productos
            .AsNoTracking()
            .Where(p => p.Id == request.Id)
            .Select(p => new ProductoDto(
                p.Id,
                p.Nombre,
                p.Descripcion,
                p.IdCategoria,
                p.Categoria != null ? p.Categoria.Nombre : null,
                p.IdGenero,
                p.Genero != null ? p.Genero.Nombre : null,
                p.IdTemporada,
                p.Temporada != null ? p.Temporada.Nombre : null,
                p.IdFit,
                p.Fit != null ? p.Fit.Nombre : null,
                p.IdMaterial,
                p.Material != null ? p.Material.Nombre : null
            ))
            .FirstOrDefaultAsync(cancellationToken);

        if (producto is null)
            return Result<ProductoDto>.Failure(ProductoErrors.NotFound(request.Id));

        return Result<ProductoDto>.Success(producto);
    }
}
