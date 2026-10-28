namespace SGCS.Domain.Entities;

public class Genero
{
    public Genero() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string Nombre { get; set; }
}

public class Temporada
{
    public Temporada() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string Nombre { get; set; }
}

public class Fit
{
    public Fit() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string Nombre { get; set; }
}

public class Material
{
    public Material() => Id = Guid.NewGuid().ToString();

    public string Id { get; private set; }
    public required string Nombre { get; set; }
}