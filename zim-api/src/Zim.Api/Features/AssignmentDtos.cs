using Zim.Domain.Entities;

namespace Zim.Api.Features;

/// <summary>
/// Yeni zimmet oluşturma DTO'su
/// </summary>
public record CreateAssignmentDto(
    int ItemId,
    int EmployeeId,
    int Quantity
);

/// <summary>
/// Zimmet listesi DTO'su
/// </summary>
public record AssignmentListDto(
    int Id,
    string ItemName,
    string ItemSKU,
    string EmployeeName,
    int Quantity,
    AssignmentStatus Status,
    DateTime AssignedAt,
    DateTime? ReturnedAt
);

/// <summary>
/// Aktif zimmetler DTO'su
/// </summary>
public record ActiveAssignmentDto(
    int Id,
    string Item,
    string Employee,
    int Quantity,
    string Status,
    DateTime AssignedAt
);

/// <summary>
/// Çalışana ait zimmetler DTO'su
/// </summary>
public record EmployeeAssignmentDto(
    int Id,
    string Item,
    int Quantity,
    AssignmentStatus Status,
    DateTime AssignedAt,
    DateTime? ReturnedAt
);
