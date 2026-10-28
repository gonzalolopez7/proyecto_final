namespace SGCS.Application.Common.Models.Dtos;

public record ProductoDto(
    string Id,
    string Nombre,
    string Descripcion,
    string IdCategoria,
    string? CategoriaNombre,
    string? IdGenero,
    string? GeneroNombre,
    string? IdTemporada,
    string? TemporadaNombre,
    string? IdFit,
    string? FitNombre,
    string? IdMaterial,
    string? MaterialNombre
);
