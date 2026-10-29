using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Proveedores.Commands;

public record DeleteProveedorCommand(string Id) : IRequest<Result>;

public class DeleteProveedorCommandValidator : AbstractValidator<DeleteProveedorCommand>
{
    public DeleteProveedorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del proveedor es obligatorio.");
    }
}

public class DeleteProveedorCommandHandler : IRequestHandler<DeleteProveedorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteProveedorCommandHandler(IApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Result> Handle(DeleteProveedorCommand request, CancellationToken cancellationToken)
    {
        var proveedor = await _context.Proveedores.FindAsync([request.Id], cancellationToken);

        if (proveedor is null)
            return Result.Failure(ProveedorErrors.NotFound(request.Id));

        _context.Proveedores.Remove(proveedor);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
