using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Zim.Api.Features;
using Zim.Domain.Entities;
using Zim.Infrastructure;

namespace Zim.Api.Controllers;

/// <summary>
/// Zimmet yönetimi API'si
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class AssignmentsController : ControllerBase
{
    private readonly ZimDbContext _context;

    public AssignmentsController(ZimDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Tüm zimmet kayıtlarını listeler
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AssignmentListDto>>> GetAssignments()
    {
        var assignments = await _context.Assignments
            .Include(a => a.Item)
            .Include(a => a.Employee)
            .ToListAsync(); // Önce veriyi çek

        var result = assignments
            .Select(a => new AssignmentListDto(
                a.Id,
                a.Item.Name,
                a.Item.SKU,
                a.Employee.FirstName + " " + a.Employee.LastName, // FullName yerine manuel birleştirme
                a.Quantity,
                a.Status,
                a.AssignedAt,
                a.ReturnedAt
            ))
            .OrderByDescending(a => a.AssignedAt)
            .ToList();

        return Ok(result);
    }

    /// <summary>
    /// Aktif zimmetleri listeler
    /// </summary>
    [HttpGet("active")]
    public async Task<ActionResult<IEnumerable<ActiveAssignmentDto>>> GetActiveAssignments()
    {
        var activeAssignments = await _context.Assignments
            .Include(a => a.Item)
            .Include(a => a.Employee)
            .Where(a => a.Status == AssignmentStatus.Assigned)
            .ToListAsync();

        var result = activeAssignments
            .Select(a => new ActiveAssignmentDto(
                a.Id,
                a.Item.Name,
                a.Employee.FullName,
                a.Quantity,
                "Zimmetli",
                a.AssignedAt
            ))
            .OrderByDescending(a => a.AssignedAt)
            .ToList();

        return Ok(result);
    }


    /// <summary>
    /// Belirtilen çalışanın zimmetlerini listeler
    /// </summary>
    [HttpGet("by-employee/{employeeId:int}")]
    public async Task<ActionResult<IEnumerable<EmployeeAssignmentDto>>> GetAssignmentsByEmployee(int employeeId)
    {
        // Çalışan var mı kontrol et
        if (!await _context.Employees.AnyAsync(e => e.Id == employeeId))
            return NotFound($"ID: {employeeId} olan çalışan bulunamadı.");

        var assignments = await _context.Assignments
            .Include(a => a.Item)
            .Where(a => a.EmployeeId == employeeId)
            .Select(a => new EmployeeAssignmentDto(
                a.Id,
                a.Item.Name,
                a.Quantity,
                a.Status,
                a.AssignedAt,
                a.ReturnedAt
            ))
            .OrderByDescending(a => a.AssignedAt)
            .ToListAsync();

        return Ok(assignments);
    }

    /// <summary>
    /// Yeni zimmet oluşturur
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> CreateAssignment(CreateAssignmentDto dto)
    {
        // Validasyonlar
        if (dto.Quantity <= 0)
            return BadRequest("Zimmet miktarı 0'dan büyük olmalıdır.");

        // Ürün kontrolü
        var item = await _context.Items.FindAsync(dto.ItemId);
        if (item == null)
            return NotFound($"ID: {dto.ItemId} olan ürün bulunamadı.");

        // Çalışan kontrolü
        var employee = await _context.Employees.FindAsync(dto.EmployeeId);
        if (employee == null)
            return NotFound($"ID: {dto.EmployeeId} olan çalışan bulunamadı.");

        // Stok kontrolü
        if (item.QuantityOnHand < dto.Quantity)
            return BadRequest($"Yetersiz stok. Elde: {item.QuantityOnHand}, İstenilen: {dto.Quantity}");

        // Zimmet oluştur
        var assignment = new Assignment
        {
            ItemId = dto.ItemId,
            EmployeeId = dto.EmployeeId,
            Quantity = dto.Quantity,
            Status = AssignmentStatus.Assigned,
            AssignedAt = DateTime.UtcNow
        };

        _context.Assignments.Add(assignment);

        // Stok güncelle
        item.QuantityOnHand -= dto.Quantity;
        item.QuantityAssigned += dto.Quantity;
        item.UpdatedAt = DateTime.UtcNow;

        // Stok hareketi kaydet
        var stockTransaction = new StockTransaction
        {
            ItemId = dto.ItemId,
            Delta = -dto.Quantity,
            Reason = StockTransaction.Reasons.Assignment
        };
        _context.StockTransactions.Add(stockTransaction);

        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAssignments), new { id = assignment.Id }, new { assignment.Id });
    }

    /// <summary>
    /// Zimmet iadesini alır
    /// </summary>
    [HttpPost("{id:int}/return")]
    public async Task<ActionResult> ReturnAssignment(int id)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Item)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
            return NotFound($"ID: {id} olan zimmet kaydı bulunamadı.");

        if (assignment.Status == AssignmentStatus.Returned)
            return BadRequest("Bu zimmet zaten iade edilmiş.");

        // İade işlemi
        assignment.Status = AssignmentStatus.Returned;
        assignment.ReturnedAt = DateTime.UtcNow;

        // Stok güncelle
        assignment.Item.QuantityOnHand += assignment.Quantity;
        assignment.Item.QuantityAssigned -= assignment.Quantity;
        assignment.Item.UpdatedAt = DateTime.UtcNow;

        // Stok hareketi kaydet
        var stockTransaction = new StockTransaction
        {
            ItemId = assignment.ItemId,
            Delta = assignment.Quantity,
            Reason = StockTransaction.Reasons.Return
        };
        _context.StockTransactions.Add(stockTransaction);

        await _context.SaveChangesAsync();

        return Ok(new { message = "Zimmet başarıyla iade edildi." });
    }

    /// <summary>
    /// Zimmet kaydını siler (sadece henüz iade edilmemişse)
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteAssignment(int id)
    {
        var assignment = await _context.Assignments
            .Include(a => a.Item)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
            return NotFound($"ID: {id} olan zimmet kaydı bulunamadı.");

        if (assignment.Status == AssignmentStatus.Assigned)
        {
            // Aktif zimmet ise önce iade et
            assignment.Item.QuantityOnHand += assignment.Quantity;
            assignment.Item.QuantityAssigned -= assignment.Quantity;
            assignment.Item.UpdatedAt = DateTime.UtcNow;

            // İade stok hareketi kaydet
            var returnTransaction = new StockTransaction
            {
                ItemId = assignment.ItemId,
                Delta = assignment.Quantity,
                Reason = StockTransaction.Reasons.Return
            };
            _context.StockTransactions.Add(returnTransaction);
        }

        _context.Assignments.Remove(assignment);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
