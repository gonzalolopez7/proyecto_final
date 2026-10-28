using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Atributos.Commands;

// --- CREATE ---
public record CreateTemporadaCommand(string Nombre) : IRequest<Result<string>>;

public class CreateTemporadaCommandValidator : AbstractValidator<CreateTemporadaCommand>
{
    public CreateTemporadaCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre de la temporada es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre de la temporada no debe superar los 50 caracteres.");
    }
}

public class CreateTemporadaCommandHandler : IRequestHandler<CreateTemporadaCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateTemporadaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateTemporadaCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Temporadas
            .AnyAsync(t => t.Nombre == request.Nombre, cancellationToken);

        if (exists)
            return Result<string>.Failure(AtributoErrors.TemporadaAlreadyExists(request.Nombre));

        var temporada = new Temporada
        {
            Nombre = request.Nombre
        };

        _context.Temporadas.Add(temporada);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(temporada.Id);
    }
}

// --- UPDATE ---
public record UpdateTemporadaRequest(string Nombre);

public record UpdateTemporadaCommand(string Id, string Nombre) : IRequest<Result>;

public class UpdateTemporadaCommandValidator : AbstractValidator<UpdateTemporadaCommand>
{
    public UpdateTemporadaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la temporada es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la temporada no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre de la temporada es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre de la temporada no debe superar los 50 caracteres.");
    }
}

public class UpdateTemporadaCommandHandler : IRequestHandler<UpdateTemporadaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateTemporadaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateTemporadaCommand request, CancellationToken cancellationToken)
    {
        var temporada = await _context.Temporadas.FindAsync([request.Id], cancellationToken);

        if (temporada is null)
            return Result.Failure(AtributoErrors.TemporadaNotFound(request.Id));

        if (temporada.Nombre != request.Nombre)
        {
            var exists = await _context.Temporadas
                .AnyAsync(t => t.Nombre == request.Nombre && t.Id != request.Id, cancellationToken);

            if (exists)
                return Result.Failure(AtributoErrors.TemporadaAlreadyExists(request.Nombre));
        }

        temporada.Nombre = request.Nombre;

        _context.Temporadas.Update(temporada);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

// --- DELETE ---
public record DeleteTemporadaCommand(string Id) : IRequest<Result>;

public class DeleteTemporadaCommandValidator : AbstractValidator<DeleteTemporadaCommand>
{
    public DeleteTemporadaCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID de la temporada es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID de la temporada no debe superar los 36 caracteres.");
    }
}

public class DeleteTemporadaCommandHandler : IRequestHandler<DeleteTemporadaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteTemporadaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteTemporadaCommand request, CancellationToken cancellationToken)
    {
        var temporada = await _context.Temporadas.FindAsync([request.Id], cancellationToken);

        if (temporada is null)
            return Result.Failure(AtributoErrors.TemporadaNotFound(request.Id));

        var inUseCount = await _context.Productos
            .CountAsync(p => p.IdTemporada == request.Id, cancellationToken);

        if (inUseCount > 0)
            return Result.Failure(AtributoErrors.TemporadaInUse(request.Id, inUseCount));

        _context.Temporadas.Remove(temporada);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
