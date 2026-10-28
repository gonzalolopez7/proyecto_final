using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Proveedores;

public static class ProveedorErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "Proveedor.NotFound",
            $"No se encontró el proveedor con ID '{id}'.");

    public static Error CuitNotFound(string cuit) =>
        Error.NotFound(
            "Proveedor.CuitNotFound",
            $"No se encontró ningún proveedor con el CUIT '{cuit}'.");

    public static Error CuitAlreadyExists(string cuit) =>
        Error.Conflict(
            "Proveedor.CuitAlreadyExists",
            $"Ya existe un proveedor activo con el CUIT '{cuit}'.");

    public static Error SoftDeletedCuit(string cuit, string existingProveedorId, string existingProveedorNombre) =>
        Error.Conflict(
            "Proveedor.SoftDeletedCuit",
            $"El CUIT '{cuit}' pertenece al proveedor '{existingProveedorNombre}' que fue dado de baja.",
            new()
            {
                ["id"] = existingProveedorId,
                ["nombre"] = existingProveedorNombre,
                ["cuit"] = cuit
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict(
            "Proveedor.NotDeleted",
            $"El proveedor con ID '{id}' no se encuentra dado de baja.");

}
