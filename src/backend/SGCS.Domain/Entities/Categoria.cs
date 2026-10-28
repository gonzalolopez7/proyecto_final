namespace SGCS.Domain.Entities;

public class Categoria
{
    public Categoria() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public string? IdPadre { get; set; }
    public Categoria? Padre { get; set; }
    public ICollection<Categoria> Subcategorias { get; set; } = new List<Categoria>();
    public required string Nombre { get; set; }
}