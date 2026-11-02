using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class TemporadaConfiguration : IEntityTypeConfiguration<Temporada>
{
    public void Configure(EntityTypeBuilder<Temporada> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(t => t.Id);
        builder.Property(t => t.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(t => t.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        // 3. Índices
        builder.HasIndex(t => t.Nombre)
            .IsUnique();
    }
}
