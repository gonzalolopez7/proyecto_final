using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Categorias.Commands;

public record CreateCategoriaCommand(
    string Nombre,
    string? IdPadre
) : IRequest<Result<string>>;

public class CreateCategoriaCommandValidator : AbstractValidator<CreateCategoriaCommand>
{
    public CreateCategoriaCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre de la categoría es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre de la categoría no debe superar los 100 caracteres.");

        RuleFor(x => x.IdPadre)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdPadre))
            .WithMessage("El ID de la categoría padre no debe superar los 36 caracteres.");
    }
}

public class CreateCategoriaCommandHandler : IRequestHandler<CreateCategoriaCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateCategoriaCommand request, CancellationToken cancellationToken)
    {
        // 1. Validar que no exista otra categoría con el mismo nombre
        var exists = await _context.Categorias
            .AnyAsync(c => c.Nombre == request.Nombre, cancellationToken);

        if (exists)
            return Result<string>.Failure(CategoriaErrors.NameAlreadyExists(request.Nombre));

        // 2. Si se especificó categoría padre, validar que exista y que no tenga productos asociados
        if (!string.IsNullOrEmpty(request.IdPadre))
        {
            var padre = await _context.Categorias
                .AsNoTracking()
                .FirstOrDefaultAsync(c => c.Id == request.IdPadre, cancellationToken);

            if (padre is null)
                return Result<string>.Failure(CategoriaErrors.ParentNotFound(request.IdPadre));

            var padreTieneProductos = await _context.Productos
                .AnyAsync(p => p.IdCategoria == request.IdPadre, cancellationToken);

            if (padreTieneProductos)
                return Result<string>.Failure(CategoriaErrors.ParentHasProducts(padre.Nombre));
        }

        // 3. Crear entidad
        var categoria = new Categoria
        {
            Nombre = request.Nombre,
            IdPadre = request.IdPadre
        };

        _context.Categorias.Add(categoria);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(categoria.Id);
    }
}
