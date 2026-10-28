using Microsoft.AspNetCore.Identity;
using SGCS.Domain.Common;

namespace SGCS.Infrastructure.Identity;

/// <summary>
/// Usuario del sistema que extiende IdentityUser e implementa IAuditableEntity
/// para registrar automáticamente la auditoría de creación y modificación.
/// </summary>
public class ApplicationUser : IdentityUser, IAuditableEntity, ISoftDeletableEntity
{
    public required string FirstName { get; set; }
    public required string LastName { get; set; }

    // IAuditableEntity
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }

    // ISoftDeletableEntity
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    public ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
}

public class ApplicationRole : IdentityRole
{
    public ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
}

public class ApplicationUserRole : IdentityUserRole<string>
{
    public ApplicationUser User { get; set; } = default!;
    public ApplicationRole Role { get; set; } = default!;
}