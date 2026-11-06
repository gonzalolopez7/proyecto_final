namespace SGCS.Application.Common.Models.Dtos;

public record DepositoDto(
    string Id,
    string Nombre,
    string? Descripcion,
    int CantidadEstanterias,
    int CantidadUnidades
);
