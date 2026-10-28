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
            .WithMessage("Username is required.")
            .MinimumLength(4)
            .WithMessage("Username must be at least 4 characters long.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required.")
            .MinimumLength(4)
            .WithMessage("Password must be at least 4 characters long.");

        RuleFor(x => x.Role)
            .NotEmpty()
            .WithMessage("Role is required.")
            .Must(x => Roles.SupportedRoles.Contains(x))
            .WithMessage("Invalid role.");

        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required.");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required.");

        RuleFor(x => x.Email)
            .EmailAddress()
            .When(x => !string.IsNullOrEmpty(x.Email))
            .WithMessage("Invalid email address.");

        RuleFor(x => x.PhoneNumber)
            .Length(10)
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Phone number must be 10 digits long.")
            .Matches("^[0-9]*$")
            .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
            .WithMessage("Phone number must contain only digits.");
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
