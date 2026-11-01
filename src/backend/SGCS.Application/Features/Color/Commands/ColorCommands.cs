using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Colores.Commands;

// --- CREATE ---
public record CreateColorCommand(
    string Nombre,
    string CodigoHex,
    string Codigo
) : IRequest<Result<string>>;

public class CreateColorCommandValidator : AbstractValidator<CreateColorCommand>
{
    public CreateColorCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del color es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre del color no debe superar los 50 caracteres.");

        RuleFor(x => x.CodigoHex)
            .NotEmpty()
            .WithMessage("El código hexadecimal es obligatorio.")
            .MaximumLength(7)
            .WithMessage("El código hexadecimal no debe superar los 7 caracteres.")
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .WithMessage("El código hexadecimal debe tener un formato válido (ej. #FFFFFF o #FFF).");

        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código del color es obligatorio.")
            .MaximumLength(10)
            .WithMessage("El código del color no debe superar los 10 caracteres.");
    }
}

public class CreateColorCommandHandler : IRequestHandler<CreateColorCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateColorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateColorCommand request, CancellationToken cancellationToken)
    {
        var nombreExists = await _context.Colores
            .AnyAsync(c => c.Nombre == request.Nombre, cancellationToken);

        if (nombreExists)
            return Result<string>.Failure(ColorErrors.NameAlreadyExists(request.Nombre));

        var codigoExists = await _context.Colores
            .AnyAsync(c => c.Codigo == request.Codigo, cancellationToken);

        if (codigoExists)
            return Result<string>.Failure(ColorErrors.CodeAlreadyExists(request.Codigo));

        var color = new Color
        {
            Nombre = request.Nombre,
            CodigoHex = request.CodigoHex.ToUpperInvariant(),
            Codigo = request.Codigo.Trim().ToUpperInvariant()
        };

        _context.Colores.Add(color);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(color.Id);
    }
}

// --- UPDATE ---
public record UpdateColorRequest(string Nombre, string CodigoHex, string Codigo);

public record UpdateColorCommand(
    string Id,
    string Nombre,
    string CodigoHex,
    string Codigo
) : IRequest<Result>;

public class UpdateColorCommandValidator : AbstractValidator<UpdateColorCommand>
{
    public UpdateColorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del color es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del color no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del color es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre del color no debe superar los 50 caracteres.");

        RuleFor(x => x.CodigoHex)
            .NotEmpty()
            .WithMessage("El código hexadecimal es obligatorio.")
            .MaximumLength(7)
            .WithMessage("El código hexadecimal no debe superar los 7 caracteres.")
            .Matches(@"^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")
            .WithMessage("El código hexadecimal debe tener un formato válido (ej. #FFFFFF o #FFF).");

        RuleFor(x => x.Codigo)
            .NotEmpty()
            .WithMessage("El código del color es obligatorio.")
            .MaximumLength(10)
            .WithMessage("El código del color no debe superar los 10 caracteres.");
    }
}

public class UpdateColorCommandHandler : IRequestHandler<UpdateColorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateColorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateColorCommand request, CancellationToken cancellationToken)
    {
        var color = await _context.Colores.FindAsync([request.Id], cancellationToken);

        if (color is null)
            return Result.Failure(ColorErrors.NotFound(request.Id));

        if (color.Nombre != request.Nombre)
        {
            var nombreExists = await _context.Colores
                .AnyAsync(c => c.Nombre == request.Nombre && c.Id != request.Id, cancellationToken);

            if (nombreExists)
                return Result.Failure(ColorErrors.NameAlreadyExists(request.Nombre));
        }

        if (color.Codigo != request.Codigo)
        {
            var codigoExists = await _context.Colores
                .AnyAsync(c => c.Codigo == request.Codigo && c.Id != request.Id, cancellationToken);

            if (codigoExists)
                return Result.Failure(ColorErrors.CodeAlreadyExists(request.Codigo));
        }

        color.Nombre = request.Nombre;
        color.CodigoHex = request.CodigoHex.ToUpperInvariant();
        color.Codigo = request.Codigo.Trim().ToUpperInvariant();

        _context.Colores.Update(color);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

// --- DELETE ---
public record DeleteColorCommand(string Id) : IRequest<Result>;

public class DeleteColorCommandValidator : AbstractValidator<DeleteColorCommand>
{
    public DeleteColorCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del color es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del color no debe superar los 36 caracteres.");
    }
}

public class DeleteColorCommandHandler : IRequestHandler<DeleteColorCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteColorCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteColorCommand request, CancellationToken cancellationToken)
    {
        var color = await _context.Colores.FindAsync([request.Id], cancellationToken);

        if (color is null)
            return Result.Failure(ColorErrors.NotFound(request.Id));

        var inUseCount = await _context.Variantes
            .CountAsync(v => v.IdColor == request.Id, cancellationToken);

        if (inUseCount > 0)
            return Result.Failure(ColorErrors.InUse(request.Id, inUseCount));

        _context.Colores.Remove(color);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

