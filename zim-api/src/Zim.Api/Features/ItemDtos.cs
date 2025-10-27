namespace Zim.Api.Features;

/// <summary>
/// Yeni ürün oluşturma DTO'su
/// </summary>
public record CreateItemDto(
    string Name,
    string SKU,
    int CategoryId,
    int? LocationId,
    int QuantityOnHand
);

/// <summary>
/// Ürün güncelleme DTO'su
/// </summary>
public record UpdateItemDto(
    string Name,
    int CategoryId,
    int? LocationId
);

/// <summary>
/// Ürün listesi DTO'su
/// </summary>
public record ItemListDto(
    int Id,
    string Name,
    string SKU,
    string Category,
    string? Location,
    int QuantityOnHand,
    int QuantityAssigned,
    int TotalQuantity
);

/// <summary>
/// Ürün detay DTO'su
/// </summary>
public record ItemDetailDto(
    int Id,
    string Name,
    string SKU,
    string Category,
    string? Location,
    int QuantityOnHand,
    int QuantityAssigned,
    int TotalQuantity,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);
