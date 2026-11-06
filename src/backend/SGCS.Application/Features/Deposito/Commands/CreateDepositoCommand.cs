
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Depositos.Commands;

public record CreateDepositoCommand(
    string Nombre,
    string? Descripcion
) : IRequest<Result<string>>;

public class CreateDepositoCommandValidator
    : AbstractValidator<CreateDepositoCommand>
{
    public CreateDepositoCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del depósito es obligatorio.")
            .MaximumLength(150)
            .WithMessage("El nombre no debe superar los 150 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(500)
            .WithMessage("La descripción no debe superar los 500 caracteres.");
    }
}

public class CreateDepositoCommandHandler
    : IRequestHandler<CreateDepositoCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateDepositoCommandHandler(IApplicationDbContext context)
        => _context = context;

    public async Task<Result<string>> Handle(
        CreateDepositoCommand request,
        CancellationToken cancellationToken)
    {
        var nombre = request.Nombre.Trim();

        var existing = await _context.Depositos
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(
                d => d.Nombre == nombre,
                cancellationToken);

        if (existing is not null)
        {
            if (existing.IsDeleted)
            {
                return Result<string>.Failure(
                    DepositoErrors.SoftDeletedNombre(
                        existing.Nombre,
                        existing.Id));
            }

            return Result<string>.Failure(
                DepositoErrors.NameAlreadyExists(nombre));
        }

        var deposito = new Deposito
        {
            Nombre = nombre,
            Descripcion = request.Descripcion?.Trim(),
            Activo = true
        };

        _context.Depositos.Add(deposito);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(deposito.Id);
    }
}
