using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class MaterialConfiguration : IEntityTypeConfiguration<Material>
{
    public void Configure(EntityTypeBuilder<Material> builder)
    {
        builder.HasKey(m => m.Id);

        builder.Property(m => m.Id)
            .HasMaxLength(36);

        builder.Property(m => m.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(m => m.Nombre)
            .IsUnique();
    }
}

