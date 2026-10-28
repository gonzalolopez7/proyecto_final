using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class TemporadaConfiguration : IEntityTypeConfiguration<Temporada>
{
    public void Configure(EntityTypeBuilder<Temporada> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasMaxLength(36);

        builder.Property(t => t.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(t => t.Nombre)
            .IsUnique();
    }
}

