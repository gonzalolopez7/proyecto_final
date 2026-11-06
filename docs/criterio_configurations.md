# **Criterio de unificación de Configurations**

1. Clave Primaria (PK)
2. Propiedades de dominio
3. Soft Delete (si aplica)
4. Índices
5. Relaciones (FK)

## **Longitudes**

- Ids: 36
- Códigos (SKU): 50
- Nombres principales (Productos, Proveedores, Razón Social): 200
- Nombres estándar (Categorías, Depósitos, Estanterías): 100
- Nombres de catálogos/atributos (Color, Talle, Fit, Material, Temporada, Género, EscalaTalle): 50 
- Descripciones / Direcciones: 500
- Emails/Usernames: 256
- Precios/Importes: HasPrecision(18, 2)
- Longitudes semánticas específicas de negocio:
  - CUIT: 11
  - Código Hexadecimal: 7
  - Teléfono: 20
  - Código de Color: 10

## **Nombres de Tablas**

- Se omite la asignación explícita de tabla (`ToTable`), delegando en EF Core la convención a partir del nombre del `DbSet` configurado en el `DbContext`.

## **SoftDelete**

- IsDeleted:
```csharp
builder.Property(e => e.IsDeleted)
    .HasDefaultValue(false);
```

- DeletedBy:
```csharp
builder.Property(e => e.DeletedBy)
    .HasMaxLength(36);
```

- DeletedAt:
  - Se infiere por convención como `DateTime?` (`timestamp with time zone` en PostgreSQL), por lo que no requiere configuración explícita.

## **DeleteBehaviors**

- Con relaciones obligatorias (FK no nula): `DeleteBehavior.Restrict`.

- Con relaciones opcionales (FK nullable): `DeleteBehavior.SetNull`.

## **Ejemplo**

```csharp
public class ProductoConfiguration : IEntityTypeConfiguration<Producto>
{
    public void Configure(EntityTypeBuilder<Producto> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(p => p.Nombre)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(p => p.Descripcion)
            .IsRequired()
            .HasMaxLength(500);

        builder.Property(p => p.IdCategoria).IsRequired().HasMaxLength(36);
        builder.Property(p => p.IdEscalaTalle).IsRequired().HasMaxLength(36);
        builder.Property(p => p.IdGenero).HasMaxLength(36);
        builder.Property(p => p.IdTemporada).HasMaxLength(36);
        builder.Property(p => p.IdFit).HasMaxLength(36);
        builder.Property(p => p.IdMaterial).HasMaxLength(36);

        // 3. Soft Delete
        builder.Property(p => p.IsDeleted).HasDefaultValue(false);
        builder.Property(p => p.DeletedBy).HasMaxLength(36);

        // 4. Índices
        builder.HasIndex(p => p.Nombre)
            .IsUnique();

        // 5. Relaciones
        builder.HasOne(p => p.Categoria)
            .WithMany()
            .HasForeignKey(p => p.IdCategoria)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.EscalaTalle)
            .WithMany()
            .HasForeignKey(p => p.IdEscalaTalle)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Genero)
            .WithMany()
            .HasForeignKey(p => p.IdGenero)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Temporada)
            .WithMany()
            .HasForeignKey(p => p.IdTemporada)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Fit)
            .WithMany()
            .HasForeignKey(p => p.IdFit)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasOne(p => p.Material)
            .WithMany()
            .HasForeignKey(p => p.IdMaterial)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
```