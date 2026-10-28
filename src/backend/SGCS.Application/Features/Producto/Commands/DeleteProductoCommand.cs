using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Productos.Commands;

public record DeleteProductoCommand(string Id) : IRequest<Result>;

public class DeleteProductoCommandValidator : AbstractValidator<DeleteProductoCommand>
{
    public DeleteProductoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del producto es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del producto no debe superar los 36 caracteres.");
    }
}

public class DeleteProductoCommandHandler : IRequestHandler<DeleteProductoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteProductoCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteProductoCommand request, CancellationToken cancellationToken)
    {
        var producto = await _context.Productos.FindAsync([request.Id], cancellationToken);

        if (producto is null)
            return Result.Failure(ProductoErrors.NotFound(request.Id));

        _context.Productos.Remove(producto);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
