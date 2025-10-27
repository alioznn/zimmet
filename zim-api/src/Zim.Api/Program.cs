using Microsoft.EntityFrameworkCore;
using Zim.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Veritabanı bağlantısı
builder.Services.AddDbContext<ZimDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// API servisleri
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS - Frontend ile iletişim için
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Veritabanı başlatma
try
{
    using (var scope = app.Services.CreateScope())
    {
        var context = scope.ServiceProvider.GetRequiredService<ZimDbContext>();
        DbInitializer.InitializeAsync(context).GetAwaiter().GetResult();
        Console.WriteLine("Veritabanı başarıyla başlatıldı.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"Veritabanı başlatma hatası: {ex.Message}");
    Console.WriteLine($"Stack trace: {ex.StackTrace}");
    // Hata olsa bile uygulamayı kapatma, sadece logla
    Console.WriteLine("Veritabanı başlatma hatası olsa da uygulama devam ediyor...");
}

// HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
// app.UseHttpsRedirection(); // HTTPS redirect'i kapatıyoruz
app.UseAuthorization();

app.MapControllers();

// Basit health check endpoint
app.MapGet("/", () => "ZIM-API OK - Zimmet Uygulaması API'si çalışıyor!")
   .WithTags("Health");

app.Run();
