namespace SGCS.Domain.Entities;

public class Color
{
    public Color() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string Nombre { get; set; }
    public required string CodigoHex { get; set; }
    public required string Codigo { get; set; }
}
