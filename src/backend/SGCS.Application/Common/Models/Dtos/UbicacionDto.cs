namespace SGCS.Application.Common.Models.Dtos;

public record UbicacionDto(
    string Id,
    string IdVariante,
    string Sku,
    string IdEstanteria,
    string NombreEstanteria,
    string IdDeposito,
    string NombreDeposito,
    int Cantidad
);