using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Productos.Queries;

public record GetProductoByNameQuery(string Nombre) : IRequest<Result<ProductoDto>>;

public class GetProductoByNameQueryValidator : AbstractValidator<GetProductoByNameQuery>
{
    public GetProductoByNameQueryValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del producto es obligatorio.")
            .MaximumLength(200)
            .WithMessage("El nombre del producto no debe superar los 200 caracteres.");
    }
}

public class GetProductoByNameQueryHandler : IRequestHandler<GetProductoByNameQuery, Result<ProductoDto>>
{
    private readonly IApplicationDbContext _context;

    public GetProductoByNameQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<ProductoDto>> Handle(GetProductoByNameQuery request, CancellationToken cancellationToken)
    {
        var producto = await _context.Productos
            .AsNoTracking()
            .Include(p => p.Categoria)
            .Include(p => p.Genero)
            .Include(p => p.Temporada)
            .Include(p => p.Fit)
            .Include(p => p.Material)
            .FirstOrDefaultAsync(p => p.Nombre == request.Nombre, cancellationToken);

        if (producto is null)
            return Result<ProductoDto>.Failure(ProductoErrors.NameNotFound(request.Nombre));

        return Result<ProductoDto>.Success(new ProductoDto(
            producto.Id,
            producto.Nombre,
            producto.Descripcion,
            producto.IdCategoria,
            producto.Categoria != null ? producto.Categoria.Nombre : null,
            producto.IdGenero,
            producto.Genero != null ? producto.Genero.Nombre : null,
            producto.IdTemporada,
            producto.Temporada != null ? producto.Temporada.Nombre : null,
            producto.IdFit,
            producto.Fit != null ? producto.Fit.Nombre : null,
            producto.IdMaterial,
            producto.Material != null ? producto.Material.Nombre : null
        ));
    }
}
