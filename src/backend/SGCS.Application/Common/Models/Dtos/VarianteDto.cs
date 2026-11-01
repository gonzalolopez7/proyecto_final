namespace SGCS.Application.Common.Models.Dtos;

public record VarianteDto(
    string Id,
    string IdProducto,
    string? ProductoNombre,
    string Sku,
    string IdTalle,
    string? TalleNombre,
    string IdColor,
    string? ColorNombre,
    string? ColorCodigoHex,
    int StockMinimo
);

