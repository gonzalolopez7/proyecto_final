using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Proveedores.Commands;

public record RestoreProveedorCommand(string Id) : IRequest<Result>;

public class RestoreProveedorCommandValidator : AbstractValidator<RestoreProveedorCommand>
{
    public RestoreProveedorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del proveedor es obligatorio.");
    }
}

public class RestoreProveedorCommandHandler : IRequestHandler<RestoreProveedorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public RestoreProveedorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(RestoreProveedorCommand request, CancellationToken cancellationToken)
    {
        var proveedor = await _context.Proveedores
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (proveedor is null)
            return Result.Failure(ProveedorErrors.NotFound(request.Id));

        if (!proveedor.IsDeleted)
            return Result.Failure(ProveedorErrors.NotDeleted(request.Id));

        proveedor.IsDeleted = false;
        proveedor.DeletedAt = null;
        proveedor.DeletedBy = null;

        _context.Proveedores.Update(proveedor);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
