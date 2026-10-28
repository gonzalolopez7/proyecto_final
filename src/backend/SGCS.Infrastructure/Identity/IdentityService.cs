using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Application.Common.Models.Dtos;
using SGCS.Application.Features.User;

namespace SGCS.Infrastructure.Identity;

public class IdentityService : IIdentityService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public IdentityService(UserManager<ApplicationUser> userManager, RoleManager<ApplicationRole> roleManager)
    {
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task<UserDto?> ValidateCredentialsAsync(string userName, string password)
    {
        var user = await _userManager.Users
            .Include(u => u.UserRoles)
            .ThenInclude(ur => ur.Role)
            .FirstOrDefaultAsync(u => u.UserName == userName);

        if (user is null)
            return null;

        if (!await _userManager.CheckPasswordAsync(user, password))
            return null;

        return new UserDto(
            user.Id,
            user.UserName!,
            user.FirstName,
            user.LastName,
            user.Email,
            user.PhoneNumber,
            user.UserRoles.FirstOrDefault()!.Role.Name!
        );
    }

    public async Task<PaginatedList<UserDto>> GetAsync(int page, int pageSize)
    {
        var query = _userManager.Users
            .AsNoTracking()
            .OrderBy(u => u.UserName)
            .Select(u => new UserDto(
                u.Id,
                u.UserName!,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault()
                ));

        return await PaginatedList<UserDto>.CreateAsync(query, page, pageSize);
    }

    public async Task<UserDto?> GetByIdAsync(string id)
    {
        return await _userManager.Users
            .AsNoTracking()
            .Where(u => u.Id == id)
            .Select(u => new UserDto(
                u.Id,
                u.UserName!,
                u.FirstName,
                u.LastName,
                u.Email,
                u.PhoneNumber,
                u.UserRoles.Select(ur => ur.Role.Name).FirstOrDefault()
                ))
            .FirstOrDefaultAsync();
    }

    public async Task<string?> GetRoleAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null) return null;

        return (await _userManager.GetRolesAsync(user)).FirstOrDefault();
    }

    public async Task<Result<string>> CreateAsync(string userName, string password, string firstName, string lastName, string? email = null, string? phoneNumber = null)
    {
        // Normalize the email and phone number in NULL if they are empty or whitespace
        email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        phoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? null : phoneNumber.Trim();

        var normalizedUserName = _userManager.NormalizeName(userName);
        var normalizedEmail = email is null ? null : _userManager.NormalizeEmail(email);

        // Check if the user already exists (including deleted users)
        var existingUser = await _userManager.Users
            .IgnoreQueryFilters()
            .Where(u => u.NormalizedUserName == normalizedUserName
                     || (normalizedEmail != null && u.NormalizedEmail == normalizedEmail))
            .FirstOrDefaultAsync();

        if (existingUser is not null)
        {
            if (existingUser.IsDeleted)
                return Result<string>.Failure(UserErrors.SoftDeletedUser(existingUser.UserName!, existingUser.Id));

            return existingUser.NormalizedUserName == _userManager.NormalizeName(userName)
                ? Result<string>.Failure(UserErrors.UserNameAlreadyExists(userName))
                : Result<string>.Failure(UserErrors.EmailAlreadyExists(email!));
        }

        var user = new ApplicationUser
        {
            UserName = userName,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            PhoneNumber = phoneNumber
        };

        var result = await _userManager.CreateAsync(user, password);

        return result.Succeeded
            ? Result<string>.Success(user.Id)
            : Result<string>.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }

    public async Task<Result> UpdateAsync(string id, string userName, string firstName, string lastName, string? email = null, string? phoneNumber = null)
    {
        // Normalize the email and phone number in NULL if they are empty or whitespace
        email = string.IsNullOrWhiteSpace(email) ? null : email.Trim();
        phoneNumber = string.IsNullOrWhiteSpace(phoneNumber) ? null : phoneNumber.Trim();

        var user = await _userManager.FindByIdAsync(id);

        if (user is null)
            return Result.Failure(UserErrors.NotFound(id));

        var normalizedUserName = _userManager.NormalizeName(userName);
        var normalizedEmail = email is null ? null : _userManager.NormalizeEmail(email);

        // Check if the user already exists (including deleted users, excluding the same user)
        var existingUser = await _userManager.Users
            .IgnoreQueryFilters()
            .Where(u => u.Id != user.Id && (u.NormalizedUserName == normalizedUserName
                     || (normalizedEmail != null && u.NormalizedEmail == normalizedEmail)))
            .FirstOrDefaultAsync();

        if (existingUser is not null)
        {
            if (existingUser.IsDeleted)
                return Result.Failure(UserErrors.SoftDeletedUser(existingUser.UserName!, existingUser.Id));

            return existingUser.NormalizedUserName == _userManager.NormalizeName(userName)
                ? Result.Failure(UserErrors.UserNameAlreadyExists(userName))
                : Result.Failure(UserErrors.EmailAlreadyExists(email!));
        }

        user.UserName = userName;
        user.FirstName = firstName;
        user.LastName = lastName;
        user.Email = email;
        user.PhoneNumber = phoneNumber;

        var result = await _userManager.UpdateAsync(user);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }

    public async Task<Result> DeleteAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            return Result.Failure(UserErrors.NotFound(userId));

        var result = await _userManager.DeleteAsync(user);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }

    public async Task<Result> RestoreAsync(string userId)
    {
        var user = await _userManager.Users
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user is null)
            return Result.Failure(UserErrors.NotFound(userId));

        if (!user.IsDeleted)
            return Result.Failure(UserErrors.NotDeleted(userId));

        user.IsDeleted = false;
        user.DeletedAt = null;
        user.DeletedBy = null;

        var result = await _userManager.UpdateAsync(user);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }

    public async Task<Result> AssignRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            return Result.Failure(UserErrors.NotFound(userId));

        if (!await _roleManager.RoleExistsAsync(role))
            return Result.Failure(UserErrors.RoleNotFound(role));

        var result = await _userManager.AddToRoleAsync(user, role);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }

    public async Task<Result> UnassignRoleAsync(string userId, string role)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            return Result.Failure(UserErrors.NotFound(userId));

        if (!await _roleManager.RoleExistsAsync(role))
            return Result.Failure(UserErrors.RoleNotFound(role));

        var result = await _userManager.RemoveFromRoleAsync(user, role);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }

    public async Task<Result> ResetPasswordAsync(string userId, string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
            return Result.Failure(UserErrors.NotFound(userId));

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var result = await _userManager.ResetPasswordAsync(user, resetToken, newPassword);

        return result.Succeeded
            ? Result.Success()
            : Result.Failure(result.Errors.Select(e => Error.Failure(e.Code, e.Description)));
    }
}
