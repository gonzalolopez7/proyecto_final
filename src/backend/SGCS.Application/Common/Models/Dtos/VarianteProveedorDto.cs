namespace SGCS.Application.Common.Models.Dtos;

public record VarianteProveedorDto(
    string Id,
    string IdVariante,
    string Sku,
    string? ProductoNombre,
    string? TalleNombre,
    string? ColorNombre,
    string? ColorCodigoHex,
    string IdProveedor,
    string? ProveedorNombre,
    string? ProveedorRazonSocial,
    string CodigoProveedor,
    decimal Costo
);

