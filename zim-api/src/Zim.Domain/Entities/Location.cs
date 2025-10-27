namespace Zim.Domain.Entities;

/// <summary>
/// Depo lokasyonları (Ana Depo, Yedek Depo, vb.)
/// </summary>
public class Location : BaseEntity
{
    public string Name { get; set; } = null!;
    
    // Navigation property - Bu lokasyondaki ürünler
    public ICollection<Item> Items { get; set; } = new List<Item>();
}
