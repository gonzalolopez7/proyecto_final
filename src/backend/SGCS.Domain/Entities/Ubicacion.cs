namespace SGCS.Domain.Entities;

public class Ubicacion
{
    public Ubicacion() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string IdVariante { get; set; }
    public Variante? Variante { get; set; }
    public required string IdEstanteria { get; set; }
    public Estanteria? Estanteria { get; set; }
    public int Cantidad { get; set; }
}
