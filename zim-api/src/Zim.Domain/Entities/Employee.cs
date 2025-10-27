namespace Zim.Domain.Entities;

/// <summary>
/// Çalışan bilgileri - zimmet atanacak kişiler
/// </summary>
public class Employee : BaseEntity
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Department { get; set; } = null!;
    
    // Navigation property - Bu çalışana ait zimmetler
    public ICollection<Assignment> Assignments { get; set; } = new List<Assignment>();
    
    // Computed property - Tam ad
    public string FullName => $"{FirstName} {LastName}";
}
