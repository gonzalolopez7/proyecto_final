namespace SGCS.Domain.Entities;

public class Talle
{
    public Talle() => Id = Guid.NewGuid().ToString();
    public string Id { get; private set; }
    public required string IdEscalaTalle { get; set; }
    public EscalaTalle? EscalaTalle { get; set; }
    public required string Nombre { get; set; }
    public required int Orden { get; set; }
}
