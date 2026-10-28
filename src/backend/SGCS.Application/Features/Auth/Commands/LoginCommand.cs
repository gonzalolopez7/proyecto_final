using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;

namespace SGCS.Application.Features.Auth.Commands;

public record LoginCommand(
    string UserName,
    string Password
) : IRequest<Result<LoginResponseDto>>;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.UserName)
            .NotEmpty()
            .WithMessage("Username is required.");

        RuleFor(x => x.Password)
            .NotEmpty()
            .WithMessage("Password is required.");
    }
}

public class LoginCommandHandler : IRequestHandler<LoginCommand, Result<LoginResponseDto>>
{
    private readonly IIdentityService _identityService;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(IIdentityService identityService, ITokenService tokenService)
    {
        _identityService = identityService;
        _tokenService = tokenService;
    }

    public async Task<Result<LoginResponseDto>> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _identityService.ValidateCredentialsAsync(request.UserName, request.Password);

        if (user is null)
            return Result<LoginResponseDto>.Failure(AuthErrors.InvalidCredentials);

        var accessToken = _tokenService.GenerateAccessToken(user.Id, user.Role ?? string.Empty);

        return Result<LoginResponseDto>.Success(new LoginResponseDto(
            accessToken,
            user.UserName,
            user.FirstName,
            user.LastName,
            user.Role ?? string.Empty));
    }
}