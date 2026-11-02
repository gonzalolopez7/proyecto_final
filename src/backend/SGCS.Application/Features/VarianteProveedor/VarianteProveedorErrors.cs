using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.VariantesProveedores;

public static class VarianteProveedorErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound(
            "VarianteProveedor.NotFound",
            $"No se encontró la relación entre variante y proveedor con ID '{id}'.");

    public static Error VarianteNotFound(string varianteId) =>
        Error.NotFound(
            "VarianteProveedor.VarianteNotFound",
            $"No se encontró la variante con ID '{varianteId}'.");

    public static Error ProveedorNotFound(string proveedorId) =>
        Error.NotFound(
            "VarianteProveedor.ProveedorNotFound",
            $"No se encontró el proveedor con ID '{proveedorId}'.");

    public static Error RelationAlreadyExists(string sku, string proveedorNombre) =>
        Error.Conflict(
            "VarianteProveedor.RelationAlreadyExists",
            $"El proveedor '{proveedorNombre}' ya se encuentra vinculado a la variante con SKU '{sku}'.");

    public static Error CodigoProveedorAlreadyExists(string codigoProveedor, string proveedorNombre) =>
        Error.Conflict(
            "VarianteProveedor.CodigoProveedorAlreadyExists",
            $"El proveedor '{proveedorNombre}' ya tiene asignado el código '{codigoProveedor}' en otra variante.");
}

