using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.User.Commands;

public record CreateUserCommand(
    string UserName,
    string Password,
    string FirstName,
    string LastName,
    string? Email,
    string? PhoneNumber,
    string Role
) : IRequest<Result<string>>;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("El nombre de usuario es obligatorio.")
            .MinimumLength(4)
            .WithMessage("El nombre de usuario debe tener al menos 4 caracteres.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("La contraseña es obligatoria.")
            .MinimumLength(4)
            .WithMessage("La contraseña debe tener al menos 4 caracteres.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("El rol es obligatorio.")
            .Must(x => Roles.SupportedRoles.Contains(x))
            .WithMessage("El rol especificado no es válido.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("El nombre es obligatorio.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("El apellido es obligatorio.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("El formato del correo electrónico no es válido.");

        RuleFor(x => x.PhoneNumber)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("El teléfono debe tener 10 dígitos.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("El teléfono solo debe contener dígitos.");
    }
}

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Result<string>>
{
    private readonly IIdentityService _identityService;

    public CreateUserCommandHandler(IIdentityService identityService) => _identityService = identityService;

    public async Task<Result<string>> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var result = await _identityService.CreateAsync(
            request.UserName,
            request.Password,
            request.FirstName,
            request.LastName,
            request.Email,
            request.PhoneNumber
        );

        if (!result.Succeeded)
            return Result<string>.Failure(result.Errors);

        var resultAssignRole = await _identityService.AssignRoleAsync(result.Value, request.Role);

        if (!resultAssignRole.Succeeded)
            return Result<string>.Failure(resultAssignRole.Errors);

        return Result<string>.Success(result.Value);
    }
}
