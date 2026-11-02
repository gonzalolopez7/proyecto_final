using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class FitConfiguration : IEntityTypeConfiguration<Fit>
{
    public void Configure(EntityTypeBuilder<Fit> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(f => f.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        // 3. Índices
        builder.HasIndex(f => f.Nombre)
            .IsUnique();
    }
}
