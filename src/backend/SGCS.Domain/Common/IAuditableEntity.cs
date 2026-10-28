namespace SGCS.Domain.Common;

/// <summary>
/// Interfaz para entidades que requieren campos de auditoría.
/// El AuditableEntityInterceptor asigna estos valores automáticamente en SaveChanges.
/// </summary>
public interface IAuditableEntity
{
    DateTime CreatedAt { get; set; }
    string? CreatedBy { get; set; }
    DateTime? UpdatedAt { get; set; }
    string? UpdatedBy { get; set; }
}