using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Depositos.Commands;

public record UpdateDepositoRequest(
    string Nombre,
    string? Descripcion
);

public record UpdateDepositoCommand(
    string Id,
    string Nombre,
    string? Descripcion
) : IRequest<Result>;

public class UpdateDepositoCommandValidator
    : AbstractValidator<UpdateDepositoCommand>
{
    public UpdateDepositoCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del depósito es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del depósito no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del depósito es obligatorio.")
            .MaximumLength(100)
            .WithMessage("El nombre del depósito no debe superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(500)
            .WithMessage("La descripción no debe superar los 500 caracteres.");
    }
}

public class UpdateDepositoCommandHandler
    : IRequestHandler<UpdateDepositoCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateDepositoCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result> Handle(
        UpdateDepositoCommand request,
        CancellationToken cancellationToken)
    {
        var deposito = await _context.Depositos
            .FirstOrDefaultAsync(
                d => d.Id == request.Id,
                cancellationToken);

        if (deposito is null)
        {
            return Result.Failure(
                DepositoErrors.NotFound(request.Id));
        }

        var nombre = request.Nombre.Trim();

        if (deposito.Nombre != nombre)
        {
            var existing = await _context.Depositos
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(
                    d => d.Nombre == nombre &&
                         d.Id != request.Id,
                    cancellationToken);

            if (existing is not null)
            {
                if (existing.IsDeleted)
                {
                    return Result.Failure(
                        DepositoErrors.SoftDeletedNombre(
                            existing.Nombre,
                            existing.Id));
                }

                return Result.Failure(
                    DepositoErrors.NameAlreadyExists(nombre));
            }
        }

        deposito.Nombre = nombre;
        deposito.Descripcion = request.Descripcion?.Trim();

        _context.Depositos.Update(deposito);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
