namespace SGCS.Domain.Entities;

public static class Roles
{
    public const string Admin = "Admin";
    public const string Encargado = "Encargado";
    public const string OperadorLogistica = "OperadorLogistica";
    public const string OperadorInventario = "OperadorInventario";
    public const string Comprador = "Comprador";

    public static readonly IReadOnlyCollection<string> SupportedRoles = new[]
    {
        Admin, Encargado, OperadorLogistica, OperadorInventario, Comprador
    };
}