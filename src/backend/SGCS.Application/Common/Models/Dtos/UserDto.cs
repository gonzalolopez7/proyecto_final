namespace SGCS.Application.Common.Models.Dtos;

public record UserDto(
    string Id,
    string UserName,
    string FirstName,
    string LastName,
    string? Email,
    string? PhoneNumber,
    string? Role
);