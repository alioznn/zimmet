using Microsoft.EntityFrameworkCore;
using Zim.Domain.Entities;

namespace Zim.Infrastructure;

/// <summary>
/// Ana veritabanı context sınıfı
/// </summary>
public class ZimDbContext : DbContext
{
    public ZimDbContext(DbContextOptions<ZimDbContext> options) : base(options)
    {
    }

    // DbSet'ler - Veritabanı tablolarına erişim
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Location> Locations => Set<Location>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<StockTransaction> StockTransactions => Set<StockTransaction>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Item konfigürasyonu
        modelBuilder.Entity<Item>(entity =>
        {
            // SKU benzersiz olmalı
            entity.HasIndex(x => x.SKU).IsUnique();
            
            // Category ile ilişki
            entity.HasOne(i => i.Category)
                  .WithMany(c => c.Items)
                  .HasForeignKey(i => i.CategoryId)
                  .OnDelete(DeleteBehavior.Restrict); // Kategori silinmesin
                  
            // Location ile ilişki (opsiyonel)
            entity.HasOne(i => i.Location)
                  .WithMany(l => l.Items)
                  .HasForeignKey(i => i.LocationId)
                  .OnDelete(DeleteBehavior.SetNull); // Lokasyon silinirse null yap
        });

        // Assignment konfigürasyonu
        modelBuilder.Entity<Assignment>(entity =>
        {
            // Item ile ilişki
            entity.HasOne(a => a.Item)
                  .WithMany(i => i.Assignments)
                  .HasForeignKey(a => a.ItemId)
                  .OnDelete(DeleteBehavior.Restrict); // Item silinmesin
                  
            // Employee ile ilişki
            entity.HasOne(a => a.Employee)
                  .WithMany(e => e.Assignments)
                  .HasForeignKey(a => a.EmployeeId)
                  .OnDelete(DeleteBehavior.Restrict); // Çalışan silinmesin
                  
            // Enum için conversion
            entity.Property(a => a.Status)
                  .HasConversion<int>();
        });

        // StockTransaction konfigürasyonu
        modelBuilder.Entity<StockTransaction>(entity =>
        {
            // Item ile ilişki
            entity.HasOne(st => st.Item)
                  .WithMany(i => i.StockTransactions)
                  .HasForeignKey(st => st.ItemId)
                  .OnDelete(DeleteBehavior.Restrict); // Item silinmesin
        });

        // Employee konfigürasyonu
        modelBuilder.Entity<Employee>(entity =>
        {
            // Email benzersiz olmalı
            entity.HasIndex(x => x.Email).IsUnique();
        });

        // String property'ler için maksimum uzunluk
        modelBuilder.Entity<Category>()
                   .Property(c => c.Name)
                   .HasMaxLength(100);

        modelBuilder.Entity<Location>()
                   .Property(l => l.Name)
                   .HasMaxLength(100);

        modelBuilder.Entity<Item>()
                   .Property(i => i.Name)
                   .HasMaxLength(200);

        modelBuilder.Entity<Item>()
                   .Property(i => i.SKU)
                   .HasMaxLength(50);

        modelBuilder.Entity<Employee>()
                   .Property(e => e.FirstName)
                   .HasMaxLength(100);

        modelBuilder.Entity<Employee>()
                   .Property(e => e.LastName)
                   .HasMaxLength(100);

        modelBuilder.Entity<Employee>()
                   .Property(e => e.Email)
                   .HasMaxLength(200);

        modelBuilder.Entity<Employee>()
                   .Property(e => e.Department)
                   .HasMaxLength(100);

        modelBuilder.Entity<StockTransaction>()
                   .Property(st => st.Reason)
                   .HasMaxLength(50);
    }
}
