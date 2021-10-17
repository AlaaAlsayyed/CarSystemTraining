using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

#nullable disable

namespace CarSystem.Models.DB
{
    public partial class CarSystemDBContext : DbContext
    {
        public CarSystemDBContext()
        {
        }

        public CarSystemDBContext(DbContextOptions<CarSystemDBContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Car> Cars { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("Relational:Collation", "Arabic_CI_AS");

            modelBuilder.Entity<Car>(entity =>
            {
                entity.ToTable("Car");

                entity.Property(e => e.LicanceId).HasMaxLength(50);

                entity.Property(e => e.Name).IsRequired();

                entity.Property(e => e.PlateNumber).HasMaxLength(50);
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
