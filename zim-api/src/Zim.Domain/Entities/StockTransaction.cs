namespace Zim.Domain.Entities;

/// <summary>
/// Stok hareketleri - her stok değişikliğini izler
/// </summary>
public class StockTransaction : BaseEntity
{
    // Foreign Key
    public int ItemId { get; set; }
    
    // Navigation Property
    public Item Item { get; set; } = null!;
    
    // Hareket Bilgileri
    public int Delta { get; set; }        // Değişim miktarı (+10 giriş, -2 zimmet, +2 iade)
    public string Reason { get; set; } = null!; // Hareket sebebi
    
    // Ortak hareket sebepleri için sabitler
    public static class Reasons
    {
        public const string InitialStock = "InitialStock";     // İlk stok girişi
        public const string Assignment = "Assignment";         // Zimmet verme
        public const string Return = "Return";                 // İade alma
        public const string ManualAdjust = "ManualAdjust";     // Manuel düzeltme
        public const string Purchase = "Purchase";             // Satın alma
        public const string Loss = "Loss";                     // Kayıp/hasar
    }
}
