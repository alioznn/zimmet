using Microsoft.EntityFrameworkCore;
using Zim.Domain.Entities;

namespace Zim.Infrastructure;

/// <summary>
/// Veritabanı başlangıç verilerini yükler
/// </summary>
public static class DbInitializer
{
    /// <summary>
    /// Veritabanını seed data ile doldurur
    /// </summary>
    public static async Task InitializeAsync(ZimDbContext context)
    {
        // Veritabanının oluşturulduğundan emin ol ve migration'ları çalıştır
        await context.Database.MigrateAsync();

        // Eğer zaten veri varsa çık
        if (await context.Categories.AnyAsync() && 
            await context.Locations.AnyAsync() && 
            await context.Employees.AnyAsync() && 
            await context.Items.AnyAsync())
        {
            Console.WriteLine("Veritabanı zaten dolu, seed data atlanıyor.");
            return; // Veritabanı zaten dolu
        }

        Console.WriteLine("Veritabanı boş, seed data ekleniyor...");

        Console.WriteLine("Seed data başlatılıyor...");

        // Kategoriler
        var categories = new[]
        {
            new Category { Name = "Cam Eşya" },
            new Category { Name = "Elektronik" },
            new Category { Name = "Mobilya" },
            new Category { Name = "Kırtasiye" }
        };

        await context.Categories.AddRangeAsync(categories);
        await context.SaveChangesAsync();
        Console.WriteLine("Kategoriler eklendi.");

        // Lokasyonlar
        var locations = new[]
        {
            new Location { Name = "Ana Depo" },
            new Location { Name = "Yedek Depo" },
            new Location { Name = "Ofis Deposu" }
        };

        await context.Locations.AddRangeAsync(locations);
        await context.SaveChangesAsync();
        Console.WriteLine("Lokasyonlar eklendi.");

        // Çalışanlar
        var employees = new[]
        {
            new Employee
            {
                FirstName = "Ali",
                LastName = "Özen",
                Email = "ali.ozen@company.com",
                Department = "Bilgi İşlem"
            },
            new Employee
            {
                FirstName = "Ayşe",
                LastName = "Kaya",
                Email = "ayse.kaya@company.com",
                Department = "Muhasebe"
            },
            new Employee
            {
                FirstName = "Mehmet",
                LastName = "Demir",
                Email = "mehmet.demir@company.com",
                Department = "İnsan Kaynakları"
            }
        };

        await context.Employees.AddRangeAsync(employees);
        await context.SaveChangesAsync();
        Console.WriteLine("Çalışanlar eklendi.");

        // Ürünler - veritabanından tekrar çek
        var camEsyaCategory = await context.Categories.FirstAsync(c => c.Name == "Cam Eşya");
        var elektronikCategory = await context.Categories.FirstAsync(c => c.Name == "Elektronik");
        var anaDepo = await context.Locations.FirstAsync(l => l.Name == "Ana Depo");

        var items = new[]
        {
            new Item
            {
                Name = "Çay Bardağı",
                SKU = "BARDAK-001",
                CategoryId = camEsyaCategory.Id,
                LocationId = anaDepo.Id,
                QuantityOnHand = 10,
                QuantityAssigned = 0
            },
            new Item
            {
                Name = "Kahve Fincanı",
                SKU = "FINCAN-001",
                CategoryId = camEsyaCategory.Id,
                LocationId = anaDepo.Id,
                QuantityOnHand = 15,
                QuantityAssigned = 0
            },
            new Item
            {
                Name = "Klavye",
                SKU = "KLAVYE-001",
                CategoryId = elektronikCategory.Id,
                LocationId = anaDepo.Id,
                QuantityOnHand = 5,
                QuantityAssigned = 0
            },
            new Item
            {
                Name = "Mouse",
                SKU = "MOUSE-001",
                CategoryId = elektronikCategory.Id,
                LocationId = anaDepo.Id,
                QuantityOnHand = 8,
                QuantityAssigned = 0
            }
        };

        await context.Items.AddRangeAsync(items);
        await context.SaveChangesAsync();
        Console.WriteLine("Ürünler eklendi.");

        // İlk stok hareketleri
        var stockTransactions = items.Select(item => new StockTransaction
        {
            ItemId = item.Id,
            Delta = item.QuantityOnHand,
            Reason = StockTransaction.Reasons.InitialStock
        }).ToArray();

        await context.StockTransactions.AddRangeAsync(stockTransactions);
        await context.SaveChangesAsync();
        Console.WriteLine("Stok hareketleri eklendi.");
        Console.WriteLine("Seed data başarıyla tamamlandı!");
    }
}
