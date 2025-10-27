using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zim.Api.Features;
using Zim.Domain.Entities;
using Zim.Infrastructure;

namespace Zim.Api.Controllers;

/// <summary>
/// Çalışan yönetimi API'si
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class EmployeesController : ControllerBase
{
    private readonly ZimDbContext _context;

    public EmployeesController(ZimDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tüm çalışanları listeler
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeListDto>>> GetEmployees()
    {
        var employees = await _context.Employees
            .Select(e => new EmployeeListDto(
                e.Id,
                e.FirstName,
                e.LastName,
                e.FullName,
                e.Email,
                e.Department
            ))
            .ToListAsync();

        return Ok(employees);
    }

    /// <summary>
    /// Belirtilen ID'deki çalışanı getirir
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeDetailDto>> GetEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Assignments.Where(a => a.Status == AssignmentStatus.Assigned))
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
        {
            return NotFound($"ID: {id} olan çalışan bulunamadı.");
        }

        var dto = new EmployeeDetailDto(
            employee.Id,
            employee.FirstName,
            employee.LastName,
            employee.FullName,
            employee.Email,
            employee.Department,
            employee.Assignments.Count,
            employee.CreatedAt
        );

        return Ok(dto);
    }

    /// <summary>
    /// Yeni çalışan oluşturur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<EmployeeDetailDto>> CreateEmployee(CreateEmployeeDto dto)
    {
        // Validasyonlar
        if (string.IsNullOrWhiteSpace(dto.FirstName))
            return BadRequest("Ad boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.LastName))
            return BadRequest("Soyad boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.Department))
            return BadRequest("Departman boş olamaz.");

        // Email benzersizlik kontrolü
        if (await _context.Employees.AnyAsync(e => e.Email == dto.Email))
            return BadRequest($"Email '{dto.Email}' zaten kullanımda.");

        // Yeni çalışan oluştur
        var employee = new Employee
        {
            FirstName = dto.FirstName.Trim(),
            LastName = dto.LastName.Trim(),
            Email = dto.Email.Trim().ToLowerInvariant(),
            Department = dto.Department.Trim()
        };

        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();

        // Oluşturulan çalışanı getir
        var createdEmployee = await GetEmployee(employee.Id);
        return CreatedAtAction(nameof(GetEmployee), new { id = employee.Id }, createdEmployee.Value);
    }

    /// <summary>
    /// Çalışan bilgilerini günceller
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateEmployee(int id, UpdateEmployeeDto dto)
    {
        var employee = await _context.Employees.FindAsync(id);
        if (employee == null)
            return NotFound($"ID: {id} olan çalışan bulunamadı.");

        // Validasyonlar
        if (string.IsNullOrWhiteSpace(dto.FirstName))
            return BadRequest("Ad boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.LastName))
            return BadRequest("Soyad boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.Email))
            return BadRequest("Email boş olamaz.");

        if (string.IsNullOrWhiteSpace(dto.Department))
            return BadRequest("Departman boş olamaz.");

        // Email benzersizlik kontrolü (kendisi hariç)
        if (await _context.Employees.AnyAsync(e => e.Email == dto.Email && e.Id != id))
            return BadRequest($"Email '{dto.Email}' zaten kullanımda.");

        // Güncelle
        employee.FirstName = dto.FirstName.Trim();
        employee.LastName = dto.LastName.Trim();
        employee.Email = dto.Email.Trim().ToLowerInvariant();
        employee.Department = dto.Department.Trim();
        employee.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Çalışanı siler (eğer aktif zimmeti yoksa)
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteEmployee(int id)
    {
        var employee = await _context.Employees
            .Include(e => e.Assignments.Where(a => a.Status == AssignmentStatus.Assigned))
            .FirstOrDefaultAsync(e => e.Id == id);

        if (employee == null)
            return NotFound($"ID: {id} olan çalışan bulunamadı.");

        // Aktif zimmet kontrolü
        if (employee.Assignments.Any())
            return BadRequest("Aktif zimmeti olan çalışan silinemez.");

        _context.Employees.Remove(employee);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
