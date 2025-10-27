namespace Zim.Domain.Entities;

/// <summary>
/// Ürün kategorileri (Cam Eşya, Elektronik, vb.)
/// </summary>
public class Category : BaseEntity
{
    public string Name { get; set; } = null!;
    
    // Navigation property - Bu kategoriye ait ürünler
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
