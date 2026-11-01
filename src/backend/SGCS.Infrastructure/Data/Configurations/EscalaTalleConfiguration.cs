using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class EscalaTalleConfiguration : IEntityTypeConfiguration<EscalaTalle>
{
    public void Configure(EntityTypeBuilder<EscalaTalle> builder)
    {
        // 1. Clave Primaria
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Id).HasMaxLength(36);

        // 2. Propiedades de Dominio
        builder.Property(e => e.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        // 3. Índices
        builder.HasIndex(e => e.Nombre)
            .IsUnique();
    }
}
