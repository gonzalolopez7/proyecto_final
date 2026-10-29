namespace SGCS.Application.Common.Models.Dtos;

public record CategoriaDto(
    string Id,
    string Nombre,
    string? IdPadre,
    string? PadreNombre,
    bool TieneProductos = false
);

public record CategoriaTreeDto(
    string Id,
    string Nombre,
    string? IdPadre,
    IReadOnlyList<CategoriaTreeDto> Subcategorias
);

