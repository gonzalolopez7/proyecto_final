using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Atributos.Commands;

// --- CREATE ---
public record CreateFitCommand(string Nombre) : IRequest<Result<string>>;

public class CreateFitCommandValidator : AbstractValidator<CreateFitCommand>
{
    public CreateFitCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del fit es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre del fit no debe superar los 50 caracteres.");
    }
}

public class CreateFitCommandHandler : IRequestHandler<CreateFitCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateFitCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateFitCommand request, CancellationToken cancellationToken)
    {
        var exists = await _context.Fits
            .AnyAsync(f => f.Nombre == request.Nombre, cancellationToken);

        if (exists)
            return Result<string>.Failure(AtributoErrors.FitAlreadyExists(request.Nombre));

        var fit = new Fit
        {
            Nombre = request.Nombre
        };

        _context.Fits.Add(fit);

        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(fit.Id);
    }
}

// --- UPDATE ---
public record UpdateFitRequest(string Nombre);

public record UpdateFitCommand(string Id, string Nombre) : IRequest<Result>;

public class UpdateFitCommandValidator : AbstractValidator<UpdateFitCommand>
{
    public UpdateFitCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del fit es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del fit no debe superar los 36 caracteres.");

        RuleFor(x => x.Nombre)
            .NotEmpty()
            .WithMessage("El nombre del fit es obligatorio.")
            .MaximumLength(50)
            .WithMessage("El nombre del fit no debe superar los 50 caracteres.");
    }
}

public class UpdateFitCommandHandler : IRequestHandler<UpdateFitCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateFitCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateFitCommand request, CancellationToken cancellationToken)
    {
        var fit = await _context.Fits.FindAsync([request.Id], cancellationToken);

        if (fit is null)
            return Result.Failure(AtributoErrors.FitNotFound(request.Id));

        if (fit.Nombre != request.Nombre)
        {
            var exists = await _context.Fits
                .AnyAsync(f => f.Nombre == request.Nombre && f.Id != request.Id, cancellationToken);

            if (exists)
                return Result.Failure(AtributoErrors.FitAlreadyExists(request.Nombre));
        }

        fit.Nombre = request.Nombre;

        _context.Fits.Update(fit);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}

// --- DELETE ---
public record DeleteFitCommand(string Id) : IRequest<Result>;

public class DeleteFitCommandValidator : AbstractValidator<DeleteFitCommand>
{
    public DeleteFitCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithMessage("El ID del fit es obligatorio.")
            .MaximumLength(36)
            .WithMessage("El ID del fit no debe superar los 36 caracteres.");
    }
}

public class DeleteFitCommandHandler : IRequestHandler<DeleteFitCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteFitCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteFitCommand request, CancellationToken cancellationToken)
    {
        var fit = await _context.Fits.FindAsync([request.Id], cancellationToken);

        if (fit is null)
            return Result.Failure(AtributoErrors.FitNotFound(request.Id));

        var inUseCount = await _context.Productos
            .CountAsync(p => p.IdFit == request.Id, cancellationToken);

        if (inUseCount > 0)
            return Result.Failure(AtributoErrors.FitInUse(request.Id, inUseCount));

        _context.Fits.Remove(fit);

        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
