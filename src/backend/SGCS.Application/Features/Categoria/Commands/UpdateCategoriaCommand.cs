using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Commands;

public record UpdateCategoriaRequest(
    string Nombre,
    string? IdPadre
);

public record UpdateCategoriaCommand(
    string Id,
    string Nombre,
    string? IdPadre
) : IRequest<Result>;

public class UpdateCategoriaCommandValidator : AbstractValidator<UpdateCategoriaCommand>
{
    public UpdateCategoriaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la categoría es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la categoría no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre de la categoría es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre de la categoría no debe superar los 100 caracteres.");

        RuleFor(x => x.IdPadre)
            .MaximumLength(36)
            .When(x => !string.IsNullOrEmpty(x.IdPadre))
            .WithMessage("El ID de la categoría padre no debe superar los 36 caracteres.");

        RuleFor(x => x)
            .Must(x => x.Id != x.IdPadre)
            .When(x => !string.IsNullOrEmpty(x.IdPadre))
            .WithMessage("Una categoría no puede ser su propio padre.");
    }
}

public class UpdateCategoriaCommandHandler : IRequestHandler<UpdateCategoriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateCategoriaCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscar la categoría a actualizar
        var categoria = await _context.Categorias.FindAsync([request.Id], cancellationToken);

        if (categoria is null)
            return Result.Failure(CategoriaErrors.NotFound(request.Id));

        // 2. Validar que no se asigne a sí misma como padre
        if (!string.IsNullOrEmpty(request.IdPadre) && request.Id == request.IdPadre)
            return Result.Failure(CategoriaErrors.CannotBeOwnParent(request.Id));

        // 3. Validar duplicado de nombre si cambió
        if (categoria.Nombre != request.Nombre)
        {
            var exists = await _context.Categorias
                .AnyAsync(c => c.Nombre == request.Nombre && c.Id != request.Id, cancellationToken);

            if (exists)
                return Result.Failure(CategoriaErrors.NameAlreadyExists(request.Nombre));
        }

        // 4. Si cambió la categoría padre, validar existencia y evitar referencias circulares
        if (!string.IsNullOrEmpty(request.IdPadre) && categoria.IdPadre != request.IdPadre)
        {
            var padreExists = await _context.Categorias
                .AnyAsync(c => c.Id == request.IdPadre, cancellationToken);

            if (!padreExists)
                return Result.Failure(CategoriaErrors.ParentNotFound(request.IdPadre));

            // Verificar que request.IdPadre no sea descendiente de request.Id
            var currentParentId = request.IdPadre;
            while (!string.IsNullOrEmpty(currentParentId))
            {
                if (currentParentId == request.Id)
                    return Result.Failure(CategoriaErrors.CircularReference(request.Id, request.IdPadre));

                currentParentId = await _context.Categorias
                    .Where(c => c.Id == currentParentId)
                    .Select(c => c.IdPadre)
                    .FirstOrDefaultAsync(cancellationToken);
            }
        }

        // 5. Actualizar propiedades
        categoria.Nombre = request.Nombre;
        categoria.IdPadre = request.IdPadre;

        _context.Categorias.Update(categoria);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
