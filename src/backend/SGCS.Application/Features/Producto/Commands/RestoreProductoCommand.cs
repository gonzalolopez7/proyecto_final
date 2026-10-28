using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Productos.Commands;

public record RestoreProductoCommand(string Id) : IRequest<Result>;

public class RestoreProductoCommandValidator : AbstractValidator<RestoreProductoCommand>
{
    public RestoreProductoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del producto es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del producto no debe superar los 36 caracteres.");
    }
}

public class RestoreProductoCommandHandler : IRequestHandler<RestoreProductoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public RestoreProductoCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(RestoreProductoCommand request, CancellationToken cancellationToken)
    {
        var producto = await _context.Productos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (producto is null)
            return Result.Failure(ProductoErrors.NotFound(request.Id));

        if (!producto.IsDeleted)
            return Result.Failure(ProductoErrors.NotDeleted(request.Id));

        producto.IsDeleted = false;
        producto.DeletedAt = null;
        producto.DeletedBy = null;

        _context.Productos.Update(producto);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
