using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class GeneroConfiguration : IEntityTypeConfiguration<Genero>
{
    public void Configure(EntityTypeBuilder<Genero> builder)
    {
        builder.HasKey(g => g.Id);

        builder.Property(g => g.Id)
            .HasMaxLength(36);

        builder.Property(g => g.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(g => g.Nombre)
            .IsUnique();
    }
}

