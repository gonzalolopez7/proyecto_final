using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class UbicacionConfiguration : IEntityTypeConfiguration<Ubicacion>
{
    public void Configure(EntityTypeBuilder<Ubicacion> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(u => u.IdVariante)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(u => u.IdEstanteria)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(u => u.Cantidad)
            .HasDefaultValue(0);

        // 3. Índices
        // Evitar duplicar una variante en la misma estantería
        builder.HasIndex(u => new { u.IdVariante, u.IdEstanteria })
            .IsUnique();

        // 4. Relaciones
        builder.HasOne(u => u.Variante)
            .WithMany()
            .HasForeignKey(u => u.IdVariante)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(u => u.Estanteria)
            .WithMany()
            .HasForeignKey(u => u.IdEstanteria)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
