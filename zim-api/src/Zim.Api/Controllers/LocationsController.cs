using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zim.Infrastructure;
using Zim.Domain.Entities;

namespace Zim.Api.Controllers;

/// <summary>
/// Lokasyon yönetimi API'si
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class LocationsController : ControllerBase
{
    private readonly ZimDbContext _context;

    public LocationsController(ZimDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tüm lokasyonları listeler
    /// </summary>
    [HttpGet]
    public async Task<ActionResult> GetLocations()
    {
        var locations = await _context.Locations
            .Select(l => new { l.Id, l.Name })
            .ToListAsync();

        return Ok(locations);
    }

    /// <summary>
    /// ID'ye göre lokasyon getirir
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult> GetLocation(int id)
    {
        var location = await _context.Locations
            .Select(l => new { l.Id, l.Name })
            .FirstOrDefaultAsync(l => l.Id == id);

        if (location == null)
        {
            return NotFound();
        }

        return Ok(location);
    }

    /// <summary>
    /// Yeni lokasyon oluşturur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateLocation([FromBody] CreateLocationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Lokasyon adı boş olamaz.");
        }

        var location = new Location
        {
            Name = dto.Name.Trim()
        };

        _context.Locations.Add(location);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetLocation), new { id = location.Id }, 
            new { location.Id, location.Name });
    }

    /// <summary>
    /// Lokasyon günceller
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateLocation(int id, [FromBody] UpdateLocationDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
        {
            return BadRequest("Lokasyon adı boş olamaz.");
        }

        var location = await _context.Locations.FindAsync(id);
        if (location == null)
        {
            return NotFound();
        }

        location.Name = dto.Name.Trim();
        await _context.SaveChangesAsync();

        return Ok(new { location.Id, location.Name });
    }

    /// <summary>
    /// Lokasyon siler
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteLocation(int id)
    {
        var location = await _context.Locations.FindAsync(id);
        if (location == null)
        {
            return NotFound();
        }

        // Lokasyonda ürün var mı kontrol et
        var hasItems = await _context.Items.AnyAsync(i => i.LocationId == id);
        if (hasItems)
        {
            return BadRequest("Bu lokasyonda ürünler bulunduğu için silinemez.");
        }

        _context.Locations.Remove(location);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}

/// <summary>
/// Lokasyon oluşturma DTO'su
/// </summary>
public class CreateLocationDto
{
    public string Name { get; set; } = null!;
}

/// <summary>
/// Lokasyon güncelleme DTO'su
/// </summary>
public class UpdateLocationDto
{
    public string Name { get; set; } = null!;
}
