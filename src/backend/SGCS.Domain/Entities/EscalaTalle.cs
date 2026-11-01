namespace SGCS.Domain.Entities;

public class EscalaTalle
{
    public EscalaTalle() => Id = Guid.NewGuid().ToString();
    public string Id { get; private set; }
    public required string Nombre { get; set; }
}
