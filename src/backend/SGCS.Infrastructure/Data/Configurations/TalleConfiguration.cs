using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class TalleConfiguration : IEntityTypeConfiguration<Talle>
{
    public void Configure(EntityTypeBuilder<Talle> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(t => t.IdEscalaTalle)
            .IsRequired()
            .HasMaxLength(36);

        builder.Property(t => t.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(t => t.Orden)
            .IsRequired();

        // 3. Índices
        // En una misma escala no puede haber dos talles con el mismo nombre
        builder.HasIndex(t => new { t.IdEscalaTalle, t.Nombre })
            .IsUnique();

        // 4. Relaciones
        builder.HasOne(t => t.EscalaTalle)
            .WithMany()
            .HasForeignKey(t => t.IdEscalaTalle)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
