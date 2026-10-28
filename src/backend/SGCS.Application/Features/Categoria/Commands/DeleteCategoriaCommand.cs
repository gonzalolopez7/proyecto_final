using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Commands;

public record DeleteCategoriaCommand(string Id) : IRequest<Result>;

public class DeleteCategoriaCommandValidator : AbstractValidator<DeleteCategoriaCommand>
{
    public DeleteCategoriaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la categoría es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la categoría no debe superar los 36 caracteres.");
    }
}

public class DeleteCategoriaCommandHandler : IRequestHandler<DeleteCategoriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteCategoriaCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscar categoría
        var categoria = await _context.Categorias.FindAsync([request.Id], cancellationToken);

        if (categoria is null)
            return Result.Failure(CategoriaErrors.NotFound(request.Id));

        // 2. Validar que no tenga subcategorías hijas asociadas
        var hasChildren = await _context.Categorias
            .AnyAsync(c => c.IdPadre == request.Id, cancellationToken);

        if (hasChildren)
            return Result.Failure(CategoriaErrors.HasChildren(request.Id));

        // 3. Validar que no tenga productos asociados
        var hasProducts = await _context.Productos
            .AnyAsync(p => p.IdCategoria == request.Id, cancellationToken);

        if (hasProducts)
            return Result.Failure(CategoriaErrors.HasProducts(request.Id));

        // 4. Eliminar categoría
        _context.Categorias.Remove(categoria);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
