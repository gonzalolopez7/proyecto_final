using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Atributos.Commands;

// --- CREATE ---
public record CreateGeneroCommand(string Nombre) : IRequest<Result<string>>;

public class CreateGeneroCommandValidator : AbstractValidator<CreateGeneroCommand>
{
    public CreateGeneroCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del género es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre del género no debe superar los 50 caracteres.");
    }
}

public class CreateGeneroCommandHandler : IRequestHandler<CreateGeneroCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateGeneroCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateGeneroCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Generos
            .AnyAsync(g => g.Nombre == request.Nombre, cancellationToken);

        if (exists)
            return Result<string>.Failure(AtributoErrors.GeneroAlreadyExists(request.Nombre));

        var genero = new Genero
        {
            Nombre = request.Nombre
        };

        _context.Generos.Add(genero);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(genero.Id);
    }
}

// --- UPDATE ---
public record UpdateGeneroRequest(string Nombre);

public record UpdateGeneroCommand(string Id, string Nombre) : IRequest<Result>;

public class UpdateGeneroCommandValidator : AbstractValidator<UpdateGeneroCommand>
{
    public UpdateGeneroCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del género es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del género no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del género es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre del género no debe superar los 50 caracteres.");
    }
}

public class UpdateGeneroCommandHandler : IRequestHandler<UpdateGeneroCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateGeneroCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateGeneroCommand request, CancellationToken cancellationToken)
    {
        var genero = await _context.Generos.FindAsync([request.Id], cancellationToken);

        if (genero is null)
            return Result.Failure(AtributoErrors.GeneroNotFound(request.Id));

        if (genero.Nombre != request.Nombre)
        {
            var exists = await _context.Generos
                .AnyAsync(g => g.Nombre == request.Nombre && g.Id != request.Id, cancellationToken);

            if (exists)
                return Result.Failure(AtributoErrors.GeneroAlreadyExists(request.Nombre));
        }

        genero.Nombre = request.Nombre;

        _context.Generos.Update(genero);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

// --- DELETE ---
public record DeleteGeneroCommand(string Id) : IRequest<Result>;

public class DeleteGeneroCommandValidator : AbstractValidator<DeleteGeneroCommand>
{
    public DeleteGeneroCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del género es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del género no debe superar los 36 caracteres.");
    }
}

public class DeleteGeneroCommandHandler : IRequestHandler<DeleteGeneroCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteGeneroCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteGeneroCommand request, CancellationToken cancellationToken)
    {
        var genero = await _context.Generos.FindAsync([request.Id], cancellationToken);

        if (genero is null)
            return Result.Failure(AtributoErrors.GeneroNotFound(request.Id));

        var inUseCount = await _context.Productos
            .CountAsync(p => p.IdGenero == request.Id, cancellationToken);

        if (inUseCount > 0)
            return Result.Failure(AtributoErrors.GeneroInUse(request.Id, inUseCount));

        _context.Generos.Remove(genero);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
