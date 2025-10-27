using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zim.Api.Features;
using Zim.Domain.Entities;
using Zim.Infrastructure;

namespace Zim.Api.Controllers;

/// <summary>
/// Ürün yönetimi API'si
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class ItemsController : ControllerBase
{
    private readonly ZimDbContext _context;

    public ItemsController(ZimDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tüm ürünleri listeler
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ItemListDto>>> GetItems()
    {
        var items = await _context.Items
            .Include(i => i.Category)
            .Include(i => i.Location)
            .Select(i => new ItemListDto(
                i.Id,
                i.Name,
                i.SKU,
                i.Category.Name,
                i.Location != null ? i.Location.Name : null,
                i.QuantityOnHand,
                i.QuantityAssigned,
                i.TotalQuantity
            ))
            .ToListAsync();

        return Ok(items);
    }

    /// <summary>
    /// Belirtilen ID'deki ürünü getirir
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ItemDetailDto>> GetItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.Category)
            .Include(i => i.Location)
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
        {
            return NotFound($"ID: {id} olan ürün bulunamadı.");
        }

        var dto = new ItemDetailDto(
            item.Id,
            item.Name,
            item.SKU,
            item.Category.Name,
            item.Location?.Name,
            item.QuantityOnHand,
            item.QuantityAssigned,
            item.TotalQuantity,
            item.CreatedAt,
            item.UpdatedAt
        );

        return Ok(dto);
    }

    /// <summary>
    /// Yeni ürün oluşturur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ItemDetailDto>> CreateItem(CreateItemDto dto)
    {
        // Validasyonlar
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Ürün adı boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.SKU))
            return BadRequest("SKU boş olamaz.");

        if (dto.QuantityOnHand < 0)
            return BadRequest("Stok miktarı negatif olamaz.");

        // SKU benzersizlik kontrolü
        if (await _context.Items.AnyAsync(i => i.SKU == dto.SKU))
            return BadRequest($"SKU '{dto.SKU}' zaten kullanımda.");

        // Kategori kontrolü
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            return BadRequest($"ID: {dto.CategoryId} olan kategori bulunamadı.");

        // Lokasyon kontrolü (opsiyonel)
        if (dto.LocationId.HasValue)
        {
            var location = await _context.Locations.FindAsync(dto.LocationId.Value);
            if (location == null)
                return BadRequest($"ID: {dto.LocationId} olan lokasyon bulunamadı.");
        }

        // Yeni ürün oluştur
        var item = new Item
        {
            Name = dto.Name.Trim(),
            SKU = dto.SKU.Trim().ToUpperInvariant(),
            CategoryId = dto.CategoryId,
            LocationId = dto.LocationId,
            QuantityOnHand = dto.QuantityOnHand,
            QuantityAssigned = 0
        };

        _context.Items.Add(item);

        // İlk stok hareketi
        if (dto.QuantityOnHand > 0)
        {
            var stockTransaction = new StockTransaction
            {
                Item = item,
                Delta = dto.QuantityOnHand,
                Reason = StockTransaction.Reasons.InitialStock
            };
            _context.StockTransactions.Add(stockTransaction);
        }

        await _context.SaveChangesAsync();

        // Oluşturulan ürünü getir
        var createdItem = await GetItem(item.Id);
        return CreatedAtAction(nameof(GetItem), new { id = item.Id }, createdItem.Value);
    }

    /// <summary>
    /// Ürün bilgilerini günceller
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateItem(int id, UpdateItemDto dto)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
            return NotFound($"ID: {id} olan ürün bulunamadı.");

        // Validasyonlar
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest("Ürün adı boş olamaz.");

        // Kategori kontrolü
        var category = await _context.Categories.FindAsync(dto.CategoryId);
        if (category == null)
            return BadRequest($"ID: {dto.CategoryId} olan kategori bulunamadı.");

        // Lokasyon kontrolü (opsiyonel)
        if (dto.LocationId.HasValue)
        {
            var location = await _context.Locations.FindAsync(dto.LocationId.Value);
            if (location == null)
                return BadRequest($"ID: {dto.LocationId} olan lokasyon bulunamadı.");
        }

        // Güncelle
        item.Name = dto.Name.Trim();
        item.CategoryId = dto.CategoryId;
        item.LocationId = dto.LocationId;
        item.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Ürünü siler (eğer zimmetli değilse)
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteItem(int id)
    {
        var item = await _context.Items
            .Include(i => i.Assignments.Where(a => a.Status == AssignmentStatus.Assigned))
            .FirstOrDefaultAsync(i => i.Id == id);

        if (item == null)
            return NotFound($"ID: {id} olan ürün bulunamadı.");

        // Aktif zimmet kontrolü
        if (item.Assignments.Any())
            return BadRequest("Aktif zimmeti olan ürün silinemez.");

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
