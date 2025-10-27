namespace Zim.Domain.Entities;

/// <summary>
/// Tüm entity'ler için ortak temel sınıf
/// </summary>
public abstract class BaseEntity
{
    public int Id { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}
