namespace SGCS.Application.Common.Models.Dtos;

public record LoginResponseDto(
    string AccessToken,
    string UserName,
    string FirstName,
    string LastName,
    string Role);