using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Productos.Commands;

public record UpdateProductoRequest(
    string Nombre,
    string Descripcion,
    string IdCategoria,
    string? IdGenero,
    string? IdTemporada,
    string? IdFit,
    string? IdMaterial
);

public record UpdateProductoCommand(
    string Id,
    string Nombre,
    string Descripcion,
    string IdCategoria,
    string? IdGenero,
    string? IdTemporada,
    string? IdFit,
    string? IdMaterial
) : IRequest<Result>;

public class UpdateProductoCommandValidator : AbstractValidator<UpdateProductoCommand>
{
    public UpdateProductoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del producto es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del producto no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del producto es obligatorio.")
            .MaximumLength(200)
            .WithMessage("El nombre del producto no debe superar los 200 caracteres.");

        RuleFor(x => x.Descripcion)
            .NotEmpty()
            .WithMessage("La descripción del producto es obligatoria.")
            .MaximumLength(500)
            .WithMessage("La descripción del producto no debe superar los 500 caracteres.");

        RuleFor(x => x.IdCategoria)
            .NotEmpty()
            .WithMessage("La categoría es obligatoria.")
            .MaximumLength(36)
            .WithMessage("El ID de categoría no debe superar los 36 caracteres.");

        RuleFor(x => x.IdGenero)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdGenero))
            .WithMessage("El ID de género no debe superar los 36 caracteres.");

        RuleFor(x => x.IdTemporada)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdTemporada))
            .WithMessage("El ID de temporada no debe superar los 36 caracteres.");

        RuleFor(x => x.IdFit)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdFit))
            .WithMessage("El ID de fit no debe superar los 36 caracteres.");

        RuleFor(x => x.IdMaterial)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdMaterial))
            .WithMessage("El ID de material no debe superar los 36 caracteres.");
    }
}

public class UpdateProductoCommandHandler : IRequestHandler<UpdateProductoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateProductoCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateProductoCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscar producto existente
        var producto = await _context.Productos.FindAsync([request.Id], cancellationToken);

        if (producto is null)
            return Result.Failure(ProductoErrors.NotFound(request.Id));

        // 2. Si cambió el nombre, verificar que no colisione con otro producto (activo o soft-deleted)
        if (producto.Nombre != request.Nombre)
        {
            var existingProducto = await _context.Productos
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Nombre == request.Nombre && p.Id != request.Id, cancellationToken);

            if (existingProducto is not null)
            {
                if (existingProducto.IsDeleted)
                {
                    return Result.Failure(ProductoErrors.SoftDeletedName(
                        existingProducto.Nombre,
                        existingProducto.Id));
                }

                return Result.Failure(ProductoErrors.NameAlreadyExists(request.Nombre));
            }
        }

        // 3. Si cambió la categoría, validar su existencia
        if (producto.IdCategoria != request.IdCategoria)
        {
            var categoriaExists = await _context.Categorias
                .AnyAsync(c => c.Id == request.IdCategoria, cancellationToken);

            if (!categoriaExists)
                return Result.Failure(ProductoErrors.CategoriaNotFound(request.IdCategoria));
        }

        // 4. Validar existencia de atributos si cambiaron o se especificaron
        if (!string.IsNullOrEmpty(request.IdGenero) && producto.IdGenero != request.IdGenero)
        {
            var generoExists = await _context.Generos.AnyAsync(g => g.Id == request.IdGenero, cancellationToken);
            if (!generoExists)
                return Result.Failure(ProductoErrors.GeneroNotFound(request.IdGenero));
        }

        if (!string.IsNullOrEmpty(request.IdTemporada) && producto.IdTemporada != request.IdTemporada)
        {
            var temporadaExists = await _context.Temporadas.AnyAsync(t => t.Id == request.IdTemporada, cancellationToken);
            if (!temporadaExists)
                return Result.Failure(ProductoErrors.TemporadaNotFound(request.IdTemporada));
        }

        if (!string.IsNullOrEmpty(request.IdFit) && producto.IdFit != request.IdFit)
        {
            var fitExists = await _context.Fits.AnyAsync(f => f.Id == request.IdFit, cancellationToken);
            if (!fitExists)
                return Result.Failure(ProductoErrors.FitNotFound(request.IdFit));
        }

        if (!string.IsNullOrEmpty(request.IdMaterial) && producto.IdMaterial != request.IdMaterial)
        {
            var materialExists = await _context.Materiales.AnyAsync(m => m.Id == request.IdMaterial, cancellationToken);
            if (!materialExists)
                return Result.Failure(ProductoErrors.MaterialNotFound(request.IdMaterial));
        }

        // 5. Actualizar propiedades
        producto.Nombre = request.Nombre;
        producto.Descripcion = request.Descripcion;
        producto.IdCategoria = request.IdCategoria;
        producto.IdGenero = request.IdGenero;
        producto.IdTemporada = request.IdTemporada;
        producto.IdFit = request.IdFit;
        producto.IdMaterial = request.IdMaterial;

        _context.Productos.Update(producto);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
