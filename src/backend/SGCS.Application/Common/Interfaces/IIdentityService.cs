using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;


namespace SGCS.Application.Common.Interfaces;

/// <summary>
/// Abstracción de Identity para operaciones de usuario (registro, validación de credenciales, roles, etc.).
/// Implementado en Infrastructure usando ASP.NET Identity.
/// </summary>
public interface IIdentityService
{
    public Task<UserDto?> ValidateCredentialsAsync(string userName, string password);
    public Task<PaginatedList<UserDto>> GetAsync(int page, int pageSize, string? search = null);
    public Task<UserDto?> GetByIdAsync(string id);
    public Task<string?> GetRoleAsync(string userId);
    public Task<Result<string>> CreateAsync(string userName, string password, string firstName, string lastName, string? email = null, string? phoneNumber = null);
    public Task<Result> UpdateAsync(string id, string userName, string firstName, string lastName, string? email = null, string? phoneNumber = null);
    public Task<Result> DeleteAsync(string userId);
    public Task<Result> RestoreAsync(string userId);
    public Task<Result> ResetPasswordAsync(string userId, string newPassword);
    public Task<Result> AssignRoleAsync(string userId, string role);
    public Task<Result> UnassignRoleAsync(string userId, string role);
}
