using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Productos.Commands;

public record CreateProductoCommand(
    string Nombre,
    string Descripcion,
    string IdCategoria,
    string? IdGenero,
    string? IdTemporada,
    string? IdFit,
    string? IdMaterial
) : IRequest<Result<string>>;

public class CreateProductoCommandValidator : AbstractValidator<CreateProductoCommand>
{
    public CreateProductoCommandValidator()
    {
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

public class CreateProductoCommandHandler : IRequestHandler<CreateProductoCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateProductoCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateProductoCommand request, CancellationToken cancellationToken)
    {
        // 1. Verificar si ya existe un producto con el mismo nombre (incluyendo soft-deleted)
        var existingProducto = await _context.Productos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Nombre == request.Nombre, cancellationToken);

        if (existingProducto is not null)
        {
            if (existingProducto.IsDeleted)
                return Result<string>.Failure(ProductoErrors.SoftDeletedName(
                    existingProducto.Nombre,
                    existingProducto.Id));

            return Result<string>.Failure(ProductoErrors.NameAlreadyExists(request.Nombre));
        }

        // 2. Verificar existencia de la categoría obligatoria
        var categoriaExists = await _context.Categorias
            .AnyAsync(c => c.Id == request.IdCategoria, cancellationToken);

        if (!categoriaExists)
            return Result<string>.Failure(ProductoErrors.CategoriaNotFound(request.IdCategoria));

        // 3. Verificar existencia de atributos opcionales
        if (!string.IsNullOrEmpty(request.IdGenero))
        {
            var generoExists = await _context.Generos.AnyAsync(g => g.Id == request.IdGenero, cancellationToken);
            if (!generoExists)
                return Result<string>.Failure(ProductoErrors.GeneroNotFound(request.IdGenero));
        }

        if (!string.IsNullOrEmpty(request.IdTemporada))
        {
            var temporadaExists = await _context.Temporadas.AnyAsync(t => t.Id == request.IdTemporada, cancellationToken);
            if (!temporadaExists)
                return Result<string>.Failure(ProductoErrors.TemporadaNotFound(request.IdTemporada));
        }

        if (!string.IsNullOrEmpty(request.IdFit))
        {
            var fitExists = await _context.Fits.AnyAsync(f => f.Id == request.IdFit, cancellationToken);
            if (!fitExists)
                return Result<string>.Failure(ProductoErrors.FitNotFound(request.IdFit));
        }

        if (!string.IsNullOrEmpty(request.IdMaterial))
        {
            var materialExists = await _context.Materiales.AnyAsync(m => m.Id == request.IdMaterial, cancellationToken);
            if (!materialExists)
                return Result<string>.Failure(ProductoErrors.MaterialNotFound(request.IdMaterial));
        }

        // 4. Crear la entidad Producto
        var producto = new Producto
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion,
            IdCategoria = request.IdCategoria,
            IdGenero = request.IdGenero,
            IdTemporada = request.IdTemporada,
            IdFit = request.IdFit,
            IdMaterial = request.IdMaterial
        };

        _context.Productos.Add(producto);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(producto.Id);
    }
}
