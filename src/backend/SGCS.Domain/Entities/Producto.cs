using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Producto : ISoftDeletableEntity
{
    public Producto() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string IdCategoria { get; set; }
    public Categoria? Categoria { get; set; }
    public required string Nombre { get; set; }
    public required string Descripcion { get; set; }
    public string? IdGenero { get; set; }
    public Genero? Genero { get; set; }
    public string? IdTemporada { get; set; }
    public Temporada? Temporada { get; set; }
    public string? IdFit { get; set; }
    public Fit? Fit { get; set; }
    public string? IdMaterial { get; set; }
    public Material? Material { get; set; }

    // ISoftDeletableEntity
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }
}