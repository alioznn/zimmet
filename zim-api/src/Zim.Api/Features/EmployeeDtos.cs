namespace Zim.Api.Features;

/// <summary>
/// Yeni çalışan oluşturma DTO'su
/// </summary>
public record CreateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    string Department
);

/// <summary>
/// Çalışan güncelleme DTO'su
/// </summary>
public record UpdateEmployeeDto(
    string FirstName,
    string LastName,
    string Email,
    string Department
);

/// <summary>
/// Çalışan listesi DTO'su
/// </summary>
public record EmployeeListDto(
    int Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string Department
);

/// <summary>
/// Çalışan detay DTO'su
/// </summary>
public record EmployeeDetailDto(
    int Id,
    string FirstName,
    string LastName,
    string FullName,
    string Email,
    string Department,
    int ActiveAssignmentsCount,
    DateTime CreatedAt
);
