using System.Globalization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SGCS.Infrastructure.Identity;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data;

public class ApplicationDbContextInitialiser
{
    private readonly ILogger<ApplicationDbContextInitialiser> _logger;
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;

    public ApplicationDbContextInitialiser(
        ILogger<ApplicationDbContextInitialiser> logger,
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while initialising the database.");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            await SeedRolesAsync();
            await SeedAdminUserAsync();
            await SeedSizeScalesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database.");
            throw;
        }
    }

    private async Task SeedRolesAsync()
    {
        var roles = new[] { Roles.Admin, Roles.Encargado, Roles.OperadorInventario, Roles.OperadorLogistica, Roles.Comprador };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                await _roleManager.CreateAsync(new ApplicationRole { Name = role });
                _logger.LogInformation("Role '{Role}' created.", role);
            }
        }
    }

    private async Task SeedAdminUserAsync()
    {
        const string adminUserName = "admin";
        const string adminPassword = "admin";
        const string adminEmail = "admin@gmail.com";

        var adminUser = await _userManager.FindByNameAsync(adminUserName);

        if (adminUser is null)
        {
            adminUser = new ApplicationUser
            {
                UserName = adminUserName,
                FirstName = "Administrador del sistema",
                LastName = string.Empty,
                Email = adminEmail
            };

            var result = await _userManager.CreateAsync(adminUser, adminPassword);

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(adminUser, Roles.Admin);
                _logger.LogInformation("Admin user created: {UserName}", adminUserName);
            }
            else
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Error creating admin user: {Errors}", errors);
            }
        }
    }

    private async Task SeedSizeScalesAsync()
    {
        // 1. Alfabética (XS a 4XL)
        var alfabetica = new[] { "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL" };

        // 2. Numérica (34 a 54 pares)
        var numerica = Enumerable.Range(17, 11)
            .Select(i => (i * 2).ToString())
            .ToList();

        // 3. Pantalones mujer (W24 a W34 con L30 y L32)
        var lengthsMujer = new[] { "L30", "L32" };
        var pantalonesMujer = (from w in Enumerable.Range(24, 11)
                               from l in lengthsMujer
                               select $"W{w}/{l}").ToList();

        // 4. Pantalones varón (W30 a W40 con L30, L32 y L34)
        var lengthsVaron = new[] { "L30", "L32", "L34" };
        var pantalonesVaron = (from w in Enumerable.Range(30, 11)
                              from l in lengthsVaron
                              select $"W{w}/{l}").ToList();

        // 5. Calzado AR/EU (34 a 46 con medios puntos)
        var calzadoArEu = new List<string>();
        for (decimal size = 34m; size <= 46m; size += 0.5m)
        {
            calzadoArEu.Add(size.ToString("0.#", CultureInfo.InvariantCulture));
        }

        // 6. Talle único (U)
        var talleUnico = new[] { "U" };

        var scalesToSeed = new (string Nombre, IReadOnlyList<string> Talles)[]
        {
            ("Alfabética", alfabetica),
            ("Numérica", numerica),
            ("Pantalones mujer", pantalonesMujer),
            ("Pantalones varón", pantalonesVaron),
            ("Calzado AR/EU", calzadoArEu),
            ("Talle único", talleUnico)
        };

        var hasChanges = false;

        foreach (var (nombreEscala, talles) in scalesToSeed)
        {
            var escalaExistente = await _context.EscalasTalles
                .FirstOrDefaultAsync(e => e.Nombre == nombreEscala);

            if (escalaExistente is null)
            {
                var escala = new EscalaTalle
                {
                    Nombre = nombreEscala
                };

                _context.EscalasTalles.Add(escala);

                var orden = 1;
                foreach (var nombreTalle in talles)
                {
                    _context.Talles.Add(new Talle
                    {
                        IdEscalaTalle = escala.Id,
                        Nombre = nombreTalle,
                        Orden = orden++
                    });
                }

                _logger.LogInformation("Size scale '{ScaleName}' created with {Count} sizes.", nombreEscala, talles.Count);
                hasChanges = true;
            }
        }

        if (hasChanges)
        {
            await _context.SaveChangesAsync();
        }
    }
}
