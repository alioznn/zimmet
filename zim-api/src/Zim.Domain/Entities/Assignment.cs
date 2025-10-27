namespace Zim.Domain.Entities;

/// <summary>
/// Zimmet durumları
/// </summary>
public enum AssignmentStatus
{
    Assigned = 1,  // Zimmetli
    Returned = 2   // İade edildi
}

/// <summary>
/// Çalışanlara yapılan zimmet kayıtları
/// </summary>
public class Assignment : BaseEntity
{
    // Foreign Keys
    public int ItemId { get; set; }
    public int EmployeeId { get; set; }
    
    // Navigation Properties
    public Item Item { get; set; } = null!;
    public Employee Employee { get; set; } = null!;
    
    // Zimmet Bilgileri
    public int Quantity { get; set; }                          // Zimmet edilen miktar
    public AssignmentStatus Status { get; set; } = AssignmentStatus.Assigned;
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow; // Zimmet tarihi
    public DateTime? ReturnedAt { get; set; }                   // İade tarihi (nullable)
    
    // Computed property - Zimmet aktif mi?
    public bool IsActive => Status == AssignmentStatus.Assigned;
}
