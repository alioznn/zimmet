namespace Zim.Domain.Entities;

/// <summary>
/// Zimmet edilebilir ürünler/malzemeler
/// </summary>
public class Item : BaseEntity
{
    public string Name { get; set; } = null!;
    public string SKU { get; set; } = null!; // Stok Kodu (benzersiz)
    
    // Foreign Keys
    public int CategoryId { get; set; }
    public int? LocationId { get; set; } // Nullable - lokasyon opsiyonel
    
    // Navigation Properties
    public Category Category { get; set; } = null!;
    public Location? Location { get; set; }
    
    // Stok Bilgileri
    public int QuantityOnHand { get; set; }    // Depoda elde kalan miktar
    public int QuantityAssigned { get; set; }  // Zimmetli toplam miktar
    
    // Navigation property - Bu ürünün zimmet kayıtları
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    public ICollection<StockTransaction> StockTransactions { get; set; } = new List<StockTransaction>();
    
    // Computed property - Toplam stok (elde + zimmetli)
    public int TotalQuantity => QuantityOnHand + QuantityAssigned;
}
