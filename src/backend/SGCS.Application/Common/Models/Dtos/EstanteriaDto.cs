namespace SGCS.Application.Common.Models.Dtos;

public record EstanteriaDto(
    string Id,
    string IdDeposito,
    string NombreDeposito,
    string Nombre,
    string? Descripcion,
    int CantidadUbicaciones,
    int CantidadUnidades
);