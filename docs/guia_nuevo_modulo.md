# Guía Paso a Paso: Cómo Implementar un Nuevo Módulo en SGCS Backend

Esta guía es un manual práctico y directo para cualquier desarrollador del equipo que necesite agregar una nueva entidad y su API correspondiente (por ejemplo: `Categoria`, `Producto`, `Cliente`, etc.), siguiendo la arquitectura y estándares establecidos en el proyecto.

Tomaremos como ejemplo la implementación de un módulo nuevo: **`Categoria`** (o puedes adaptarlo a la entidad que te toque).

---

## Índice del Proceso

```
Paso 1: Capa de Dominio (SGCS.Domain)
   └── Crear la Entidad con sus interfaces (ISoftDeletableEntity, etc.)

Paso 2: Capa de Infraestructura (SGCS.Infrastructure)
   ├── Crear Configuration (Fluent API)
   ├── Registrar DbSet en IApplicationDbContext y ApplicationDbContext
   └── Crear y aplicar la Migración de Entity Framework Core

Paso 3: Capa de Aplicación (SGCS.Application)
   ├── Crear Catálogo de Errores ({Entidad}Errors.cs)
   ├── Crear DTOs de Salida
   ├── Implementar Commands (Create, Update, Delete, Restore) con Validadores y Handlers
   └── Implementar Queries (Listado paginado, Obtener por ID) con Validadores y Handlers

Paso 4: Capa de API (SGCS.API)
   └── Crear el Controlador ({Entidad}Controller.cs)

Paso 5: Verificación y Checklist
```

---

## Paso 1: Capa de Dominio (`SGCS.Domain`)

Ubicación: `SGCS.Domain/Entities/Categoria.cs`

1. Define la clase con sus propiedades de negocio.
2. Si la entidad soporta borrado lógico, implementa `ISoftDeletableEntity`.
3. Si requiere auditoría automática (fecha de creación/modificación), implementa `IAuditableEntity`.
4. Inicializa el `Id` como un `Guid` en formato string dentro del constructor.

```csharp
using SGCS.Domain.Common;

namespace SGCS.Domain.Entities;

public class Categoria : ISoftDeletableEntity, IAuditableEntity
{
    public Categoria()
    {
        Id = Guid.NewGuid().ToString();
    }

    public string Id { get; set; }
    public required string Nombre { get; set; }
    public string? Descripcion { get; set; }

    // ISoftDeletableEntity (se gestiona automáticamente vía SoftDeleteInterceptor)
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
    public string? DeletedBy { get; set; }

    // IAuditableEntity (se gestiona automáticamente vía AuditableEntityInterceptor)
    public DateTime CreatedAt { get; set; }
    public string? CreatedBy { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public string? UpdatedBy { get; set; }
}
```

---

## Paso 2: Capa de Infraestructura (`SGCS.Infrastructure`)

### A. Crear la Configuración de EF Core
Ubicación: `SGCS.Infrastructure/Data/Configurations/CategoriaConfiguration.cs`

Define longitudes máximas, campos requeridos e índices únicos:

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SGCS.Domain.Entities;

namespace SGCS.Infrastructure.Data.Configurations;

public class CategoriaConfiguration : IEntityTypeConfiguration<Categoria>
{
    public void Configure(EntityTypeBuilder<Categoria> builder)
    {
        builder.HasKey(c => c.Id);

        builder.Property(c => c.Nombre)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(c => c.Descripcion)
            .HasMaxLength(500);

        builder.Property(c => c.IsDeleted)
            .HasDefaultValue(false);

        // Índice único en el Nombre (para evitar duplicados)
        builder.HasIndex(c => c.Nombre)
            .IsUnique();
    }
}
```

### B. Registrar el `DbSet` en las Interfaces y Contextos
1. En `SGCS.Application/Common/Interfaces/IApplicationDbContext.cs`:
   ```csharp
   DbSet<Categoria> Categorias { get; }
   ```
2. En `SGCS.Infrastructure/Data/ApplicationDbContext.cs`:
   ```csharp
   public DbSet<Categoria> Categorias => Set<Categoria>();
   ```

### C. Crear y Ejecutar la Migración de Base de Datos
Abre la terminal en la carpeta `backend/` y corre:

```bash
# 1. Crear la migración
dotnet ef migrations add AddCategoriaEntity --project SGCS.Infrastructure --startup-project SGCS.API

# 2. Aplicar la migración a PostgreSQL
dotnet ef database update --project SGCS.Infrastructure --startup-project SGCS.API
```

---

## Paso 3: Capa de Aplicación (`SGCS.Application`)

Estructura de carpetas recomendada:
```
SGCS.Application/Features/Categorias/
├── CategoriaErrors.cs
├── Commands/
│   ├── CreateCategoriaCommand.cs
│   ├── UpdateCategoriaCommand.cs
│   ├── DeleteCategoriaCommand.cs
│   └── RestoreCategoriaCommand.cs
└── Queries/
    ├── GetCategoriasQuery.cs
    └── GetCategoriaByIdQuery.cs
```

### A. Crear el Catálogo de Errores
Ubicación: `SGCS.Application/Features/Categorias/CategoriaErrors.cs`

```csharp
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias;

public static class CategoriaErrors
{
    public static Error NotFound(string id) =>
        Error.NotFound("Categoria.NotFound", $"No se encontró la categoría con ID '{id}'.");

    public static Error NombreAlreadyExists(string nombre) =>
        Error.Conflict("Categoria.NombreAlreadyExists", $"Ya existe una categoría activa con el nombre '{nombre}'.");

    public static Error SoftDeletedNombre(string nombre, string existingId) =>
        Error.Conflict(
            "Categoria.SoftDeletedNombre",
            $"La categoría '{nombre}' ya existe pero fue dada de baja.",
            new()
            {
                ["existingCategoriaId"] = existingId,
                ["nombre"] = nombre
            });

    public static Error NotDeleted(string id) =>
        Error.Conflict("Categoria.NotDeleted", $"La categoría con ID '{id}' no se encuentra dada de baja.");
}
```

### B. Crear el DTO de Respuesta
Ubicación: `SGCS.Application/Common/Models/Dtos/CategoriaDto.cs` (o dentro de la feature):

```csharp
namespace SGCS.Application.Common.Models;

public record CategoriaDto(
    string Id,
    string Nombre,
    string? Descripcion
);
```

---

### C. Implementar Commands

#### 1. `CreateCategoriaCommand.cs`
Agrupa en un solo archivo el **Record**, su **Validador FluentValidation** y su **Handler**:

```csharp
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;
using SGCS.Domain.Entities;

namespace SGCS.Application.Features.Categorias.Commands;

public record CreateCategoriaCommand(
    string Nombre,
    string? Descripcion
) : IRequest<Result<string>>;

public class CreateCategoriaCommandValidator : AbstractValidator<CreateCategoriaCommand>
{
    public CreateCategoriaCommandValidator()
    {
        RuleFor(x => x.Nombre)
            .NotEmpty().WithMessage("El nombre es requerido.")
            .MaximumLength(100).WithMessage("El nombre no debe superar los 100 caracteres.");

        RuleFor(x => x.Descripcion)
            .MaximumLength(500).WithMessage("La descripción no debe superar los 500 caracteres.");
    }
}

public class CreateCategoriaCommandHandler : IRequestHandler<CreateCategoriaCommand, Result<string>>
{
    private readonly IApplicationDbContext _context;

    public CreateCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<string>> Handle(CreateCategoriaCommand request, CancellationToken cancellationToken)
    {
        // 1. Buscamos ignorando soft-delete para detectar colisiones
        var existing = await _context.Categorias
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Nombre == request.Nombre, cancellationToken);

        if (existing is not null)
        {
            if (existing.IsDeleted)
            {
                return Result<string>.Failure(
                    CategoriaErrors.SoftDeletedNombre(existing.Nombre, existing.Id));
            }

            return Result<string>.Failure(CategoriaErrors.NombreAlreadyExists(request.Nombre));
        }

        // 2. Creamos la entidad
        var categoria = new Categoria
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync(cancellationToken);

        return Result<string>.Success(categoria.Id);
    }
}
```

#### 2. `UpdateCategoriaCommand.cs`
```csharp
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Commands;

public record UpdateCategoriaRequest(string Nombre, string? Descripcion);

public record UpdateCategoriaCommand(string Id, string Nombre, string? Descripcion) : IRequest<Result>;

public class UpdateCategoriaCommandValidator : AbstractValidator<UpdateCategoriaCommand>
{
    public UpdateCategoriaCommandValidator()
    {
        RuleFor(x => x.Id).NotEmpty().WithMessage("El ID es requerido.");
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Descripcion).MaximumLength(500);
    }
}

public class UpdateCategoriaCommandHandler : IRequestHandler<UpdateCategoriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public UpdateCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(UpdateCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _context.Categorias.FindAsync([request.Id], cancellationToken);
        if (categoria is null)
            return Result.Failure(CategoriaErrors.NotFound(request.Id));

        if (categoria.Nombre != request.Nombre)
        {
            var existing = await _context.Categorias
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(c => c.Nombre == request.Nombre && c.Id != request.Id, cancellationToken);

            if (existing is not null)
            {
                if (existing.IsDeleted)
                    return Result.Failure(CategoriaErrors.SoftDeletedNombre(existing.Nombre, existing.Id));

                return Result.Failure(CategoriaErrors.NombreAlreadyExists(request.Nombre));
            }
        }

        categoria.Nombre = request.Nombre;
        categoria.Descripcion = request.Descripcion;

        _context.Categorias.Update(categoria);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
```

#### 3. `DeleteCategoriaCommand.cs`
```csharp
using FluentValidation;
using MediatR;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Commands;

public record DeleteCategoriaCommand(string Id) : IRequest<Result>;

public class DeleteCategoriaCommandValidator : AbstractValidator<DeleteCategoriaCommand>
{
    public DeleteCategoriaCommandValidator() => RuleFor(x => x.Id).NotEmpty();
}

public class DeleteCategoriaCommandHandler : IRequestHandler<DeleteCategoriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public DeleteCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(DeleteCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _context.Categorias.FindAsync([request.Id], cancellationToken);
        if (categoria is null)
            return Result.Failure(CategoriaErrors.NotFound(request.Id));

        // SoftDeleteInterceptor transformará el Remove en un update con IsDeleted = true
        _context.Categorias.Remove(categoria);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
```

#### 4. `RestoreCategoriaCommand.cs`
```csharp
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Commands;

public record RestoreCategoriaCommand(string Id) : IRequest<Result>;

public class RestoreCategoriaCommandValidator : AbstractValidator<RestoreCategoriaCommand>
{
    public RestoreCategoriaCommandValidator() => RuleFor(x => x.Id).NotEmpty();
}

public class RestoreCategoriaCommandHandler : IRequestHandler<RestoreCategoriaCommand, Result>
{
    private readonly IApplicationDbContext _context;

    public RestoreCategoriaCommandHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result> Handle(RestoreCategoriaCommand request, CancellationToken cancellationToken)
    {
        var categoria = await _context.Categorias
            .IgnoreQueryFilters()
            .FirstOrDefaultAsync(c => c.Id == request.Id, cancellationToken);

        if (categoria is null)
            return Result.Failure(CategoriaErrors.NotFound(request.Id));

        if (!categoria.IsDeleted)
            return Result.Failure(CategoriaErrors.NotDeleted(request.Id));

        categoria.IsDeleted = false;
        categoria.DeletedAt = null;
        categoria.DeletedBy = null;

        _context.Categorias.Update(categoria);
        await _context.SaveChangesAsync(cancellationToken);

        return Result.Success();
    }
}
```

---

### D. Implementar Queries

#### 1. `GetCategoriasQuery.cs` (Paginado)
```csharp
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Queries;

public record GetCategoriasQuery(int Page = 1, int PageSize = 10) : IRequest<PaginatedList<CategoriaDto>>;

public class GetCategoriasQueryValidator : AbstractValidator<GetCategoriasQuery>
{
    public GetCategoriasQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).GreaterThanOrEqualTo(1);
    }
}

public class GetCategoriasQueryHandler : IRequestHandler<GetCategoriasQuery, PaginatedList<CategoriaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriasQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<PaginatedList<CategoriaDto>> Handle(GetCategoriasQuery request, CancellationToken cancellationToken)
    {
        var query = _context.Categorias
            .AsNoTracking()
            .OrderBy(c => c.Nombre)
            .Select(c => new CategoriaDto(c.Id, c.Nombre, c.Descripcion));

        return await PaginatedList<CategoriaDto>.CreateAsync(query, request.Page, request.PageSize);
    }
}
```

#### 2. `GetCategoriaByIdQuery.cs`
```csharp
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using SGCS.Application.Common.Interfaces;
using SGCS.Application.Common.Models;

namespace SGCS.Application.Features.Categorias.Queries;

public record GetCategoriaByIdQuery(string Id) : IRequest<Result<CategoriaDto>>;

public class GetCategoriaByIdQueryValidator : AbstractValidator<GetCategoriaByIdQuery>
{
    public GetCategoriaByIdQueryValidator() => RuleFor(x => x.Id).NotEmpty();
}

public class GetCategoriaByIdQueryHandler : IRequestHandler<GetCategoriaByIdQuery, Result<CategoriaDto>>
{
    private readonly IApplicationDbContext _context;

    public GetCategoriaByIdQueryHandler(IApplicationDbContext context) => _context = context;

    public async Task<Result<CategoriaDto>> Handle(GetCategoriaByIdQuery request, CancellationToken cancellationToken)
    {
        var categoria = await _context.Categorias
            .AsNoTracking()
            .Where(c => c.Id == request.Id)
            .Select(c => new CategoriaDto(c.Id, c.Nombre, c.Descripcion))
            .FirstOrDefaultAsync(cancellationToken);

        if (categoria is null)
            return Result<CategoriaDto>.Failure(CategoriaErrors.NotFound(request.Id));

        return Result<CategoriaDto>.Success(categoria);
    }
}
```

---

## Paso 4: Capa de API (`SGCS.API`)

Ubicación: `SGCS.API/Controllers/CategoriaController.cs`

**Reglas de oro del Controlador:**
1. Inyectar únicamente `IMediator`.
2. Agregar decoradores `[ApiController]`, `[Route("api/[controller]")]`, `[Produces("application/json")]` y `[Authorize(Roles = Roles.Admin)]`.
3. Usar `this.ToProblemDetails(result)` para cualquier fallo.

```csharp
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SGCS.API.Common;
using SGCS.Application.Features.Categorias.Commands;
using SGCS.Application.Features.Categorias.Queries;
using SGCS.Domain.Entities;

namespace SGCS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = Roles.Admin)]
public class CategoriaController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriaController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateCategoriaCommand command)
    {
        var result = await _mediator.Send(command);

        return result.Succeeded
            ? CreatedAtAction(nameof(GetById), new { id = result.Value }, result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] GetCategoriasQuery query)
    {
        var list = await _mediator.Send(query);
        return Ok(list);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById([FromRoute] string id)
    {
        var result = await _mediator.Send(new GetCategoriaByIdQuery(id));

        return result.Succeeded
            ? Ok(result.Value)
            : this.ToProblemDetails(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateCategoriaRequest request)
    {
        var result = await _mediator.Send(new UpdateCategoriaCommand(id, request.Nombre, request.Descripcion));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete([FromRoute] string id)
    {
        var result = await _mediator.Send(new DeleteCategoriaCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }

    [HttpPost("{id}/restore")]
    public async Task<IActionResult> Restore([FromRoute] string id)
    {
        var result = await _mediator.Send(new RestoreCategoriaCommand(id));

        return result.Succeeded
            ? NoContent()
            : this.ToProblemDetails(result);
    }
}
```

---

## Paso 5: Verificación y Checklist de Calidad

Antes de crear un Pull Request o dar por terminado un módulo, verifica los siguientes puntos:

- [ ] **Compilación limpia:** Ejecutar `dotnet build SGCS.sln` y verificar **0 errores y 0 warnings**.
- [ ] **Migración aplicada:** La base de datos tiene la tabla y los índices correctos.
- [ ] **Sin lógica en Controllers:** El controlador solo tiene llamadas a `_mediator.Send()` y `this.ToProblemDetails()`.
- [ ] **AsNoTracking en Queries:** Todas las consultas de lectura usan `.AsNoTracking()`.
- [ ] **DTOs de Salida:** Ningún endpoint devuelve entidades de base de datos directas (`Categoria`); siempre devuelven DTOs (`CategoriaDto`).
- [ ] **Errores Tipados:** Ningún Handler devuelve strings sueltos (`Result.Failure("error...")`); todos usan `{Entidad}Errors.Metodo()`.
- [ ] **Manejo de Soft-Delete en Creación:** El comando `Create` comprueba si el valor único ya existía en un registro borrado usando `.IgnoreQueryFilters()` para devolver el error `SoftDeleted...` con sus extensiones.
- [ ] **Swagger probado:** Los endpoints se probaron desde Swagger UI (`http://localhost:5000/swagger` o similar), verificando tanto casos de éxito (200, 201, 204) como casos de conflicto/error (400, 404, 409).
