using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Proveedores.Commands;

public record UpdateProveedorRequest(
    string Nombre,
    string RazonSocial,
    string Cuit,
    string? Telefono,
    string? Direccion,
    string? Email,
    int DiasPago,
    decimal SaldoInicial
);

public record UpdateProveedorCommand(
    string Id,
    string Nombre,
    string RazonSocial,
    string Cuit,
    string? Telefono,
    string? Direccion,
    string? Email,
    int DiasPago,
    decimal SaldoInicial
) : IRequest<Result>;

public class UpdateProveedorCommandValidator : AbstractValidator<UpdateProveedorCommand>
{
    public UpdateProveedorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("Id is required.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("Nombre is required.")
            .MaximumLength(200)
            .WithMessage("Nombre must not exceed 200 characters.");

        RuleFor(x => x.RazonSocial)
            .NotEmpty()
            .WithMessage("RazonSocial is required.")
            .MaximumLength(200)
            .WithMessage("RazonSocial must not exceed 200 characters.");

        RuleFor(x => x.Cuit)
            .NotEmpty()
            .WithMessage("CUIT is required.")
            .MaximumLength(20)
            .WithMessage("CUIT must not exceed 20 characters.");

        RuleFor(x => x.Telefono)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.Telefono))
            .WithMessage("Telefono must be 10 digits long.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.Telefono))
            .WithMessage("Telefono must contain only digits.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Email must be valid.");

        RuleFor(x => x.DiasPago)
            .GreaterThanOrEqualTo(0)
            .WithMessage("DiasPago must be greater than or equal to 0.");

        RuleFor(x => x.SaldoInicial)
            .GreaterThanOrEqualTo(0)
            .WithMessage("SaldoInicial must be greater than or equal to 0.");
    }
}

public class UpdateProveedorCommandHandler : IRequestHandler<UpdateProveedorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateProveedorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateProveedorCommand request, CancellationToken cancellationToken)
    {
        var proveedor = await _context.Proveedores.FindAsync([request.Id], cancellationToken);

        if (proveedor is null)
            return Result.Failure(ProveedorErrors.NotFound(request.Id));

        if (proveedor.Cuit != request.Cuit)
        {
            var existingProveedor = await _context.Proveedores
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(p => p.Cuit == request.Cuit && p.Id != request.Id, cancellationToken);

            if (existingProveedor is not null)
            {
                if (existingProveedor.IsDeleted)
                {
                    return Result.Failure(ProveedorErrors.SoftDeletedCuit(
                        existingProveedor.Cuit,
                        existingProveedor.Id,
                        existingProveedor.Nombre));
                }

                return Result.Failure(ProveedorErrors.CuitAlreadyExists(request.Cuit));
            }
        }

        proveedor.Nombre = request.Nombre;
        proveedor.RazonSocial = request.RazonSocial;
        proveedor.Cuit = request.Cuit;
        proveedor.Telefono = request.Telefono;
        proveedor.Direccion = request.Direccion;
        proveedor.Email = request.Email;
        proveedor.DiasPago = request.DiasPago;
        proveedor.SaldoInicial = request.SaldoInicial;

        _context.Proveedores.Update(proveedor);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}