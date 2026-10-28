using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class FitConfiguration : IEntityTypeConfiguration<Fit>
{
    public void Configure(EntityTypeBuilder<Fit> builder)
    {
        builder.HasKey(f => f.Id);

        builder.Property(f => f.Id)
            .HasMaxLength(36);

        builder.Property(f => f.Nombre)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(f => f.Nombre)
            .IsUnique();
    }
}

