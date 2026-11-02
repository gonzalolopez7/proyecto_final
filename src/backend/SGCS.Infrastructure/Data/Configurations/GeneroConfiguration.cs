using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class GeneroConfiguration : IEntityTypeConfiguration<Genero>
{
    public void Configure(EntityTypeBuilder<Genero> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(g => g.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        // 3. Índices
        builder.HasIndex(g => g.Nombre)
            .IsUnique();
    }
}
