using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class ColorConfiguration : IEntityTypeConfiguration<Color>
{
    public void Configure(EntityTypeBuilder<Color> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(c => c.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(c => c.CodigoHex)
            .IsRequired()
            .HasMaxLength(7);

        builder.Property(c => c.Codigo)
            .IsRequired()
            .HasMaxLength(10);

        // 3. Índices
        builder.HasIndex(c => c.Nombre)
            .IsUnique();

        builder.HasIndex(c => c.Codigo)
            .IsUnique();
    }
}

