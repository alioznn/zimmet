using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zim.Infrastructure;
using Zim.Domain.Entities;

namespace Zim.Api.Controllers;

/// <summary>
/// Kategori yönetimi API'si
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly ZimDbContext _context;

    public CategoriesController(ZimDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tüm kategorileri listeler
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new { c.Id, c.Name })
            .ToListAsync();

        return Ok(categories);
    }

    /// <summary>
    /// ID'ye göre kategori getirir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetCategory(int id)
    {
        var category = await _context.Categories
            .Select(c => new { c.Id, c.Name })
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    /// <summary>
    /// Yeni kategori oluşturur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateCategory([FromBody] CreateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Kategori adı boş olamaz.");
        }

        var category = new Category
        {
            Name = dto.Name.Trim()
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, 
            new { category.Id, category.Name });
    }

    /// <summary>
    /// Kategori günceller
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Kategori adı boş olamaz.");
        }

        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        category.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();

        return Ok(new { category.Id, category.Name });
    }

    /// <summary>
    /// Kategori siler
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteCategory(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null)
        {
            return NotFound();
        }

        // Kategoriye ait ürün var mı kontrol et
        var hasItems = await _context.Items.AnyAsync(i => i.CategoryId == id);
        if (hasItems)
        {
            return BadRequest("Bu kategoriye ait ürünler bulunduğu için silinemez.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

/// <summary>
/// Kategori oluşturma DTO'su
/// </summary>
public class CreateCategoryDto
{
    public string Name { get; set; } = null!;
}

/// <summary>
/// Kategori güncelleme DTO'su
/// </summary>
public class UpdateCategoryDto
{
    public string Name { get; set; } = null!;
}
