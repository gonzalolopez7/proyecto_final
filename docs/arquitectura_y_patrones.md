# Arquitectura, Tecnologías y Patrones de Diseño — SGCS Backend

Este documento detalla la arquitectura, las tecnologías elegidas, los patrones de diseño y los flujos de ejecución del backend de **SGCS (Sistema de Gestión Comercial y Stock)**. Su objetivo es servir como guía de inducción y referencia técnica para todo el equipo de desarrollo.

---

## 1. Stack Tecnológico

| Tecnología / Librería | Versión | Propósito en el Proyecto |
| :--- | :---: | :--- |
| **.NET** | `8.0` | Framework base para el desarrollo del backend (C# 12). |
| **ASP.NET Core Web API** | `8.0` | Exposición de endpoints RESTful. |
| **Entity Framework Core** | `8.x` | ORM para mapeo objeto-relacional y consultas a base de datos. |
| **Npgsql.EntityFrameworkCore.PostgreSQL**| `8.x` | Driver y proveedor de EF Core para PostgreSQL. |
| **MediatR** | `14.2.0` | Implementación del patrón Mediator, CQRS y pipeline behaviors. |
| **FluentValidation** | `12.2.0` | Validación declarativa de reglas de entrada en Commands y Queries. |
| **ASP.NET Core Identity** | `8.0` | Gestión de usuarios, roles, contraseñas y claims. |
| **JWT (Json Web Tokens)** | `8.0` | Autenticación y autorización basada en roles (Stateless). |
| **Swashbuckle / OpenAPI** | `6.6.2` | Documentación interactiva de la API (Swagger UI). |

---

## 2. Estructura de la Solución (Clean Architecture)

El proyecto sigue los principios de **Clean Architecture** (Arquitectura Limpia) y separación por capas concéntricas con regla de dependencia unidireccional hacia el núcleo:

$$\text{SGCS.API} \longrightarrow \text{SGCS.Infrastructure} \longrightarrow \text{SGCS.Application} \longrightarrow \text{SGCS.Domain}$$

```
backend/
├── SGCS.Domain/            <- [Capa Central] Entidades de negocio, enums e interfaces comunes.
├── SGCS.Application/       <- [Casos de Uso] CQRS (Features), Interfaces, DTOs, Validaciones y Result Pattern.
├── SGCS.Infrastructure/    <- [Detalles de Infra] EF Core, PostgreSQL, Identity, Interceptores y Tokens.
└── SGCS.API/               <- [Entrada HTTP] Controladores, Middlewares, Filtros y Configuración.
```

### Detalle de cada Capa:

### 1. `SGCS.Domain` (El Núcleo)
- **Responsabilidad:** Modela los datos y conceptos puros del negocio.
- **Regla de oro:** No tiene **ninguna dependencia** hacia los demás proyectos ni librerías externas (solo tipos base de C#).
- **Contenido:**
  - `Entities/`: Clases de dominio (ej. `Proveedor`, `Roles`).
  - `Common/`: Interfaces estructurales de dominio:
    - `ISoftDeletableEntity`: Marca entidades que soportan borrado lógico (`IsDeleted`, `DeletedAt`, `DeletedBy`).
    - `IAuditableEntity`: Marca entidades con campos de auditoría (`CreatedAt`, `CreatedBy`, `UpdatedAt`, `UpdatedBy`).
    - `IHasDomainEvents`: Para despacho de eventos de dominio antes de guardar cambios.
  - `Exceptions/`: Excepciones puras de dominio (`DomainException`).

### 2. `SGCS.Application` (Lógica de Aplicación)
- **Responsabilidad:** Orquestar los casos de uso del sistema.
- **Dependencias:** Solo conoce a `SGCS.Domain`.
- **Estructura por Vertical Slices (Features):**
  En lugar de carpetas horizontales enormes (`Controllers`, `Services`, `Repositories`), cada entidad agrupa su lógica dentro de `Features/{Entidad}`:
  - `Features/{Entidad}/Commands/`: Modificaciones de estado (Crear, Actualizar, Borrar, Restaurar).
  - `Features/{Entidad}/Queries/`: Consultas de solo lectura (Listar paginado, Obtener por ID).
  - `Features/{Entidad}/{Entidad}Errors.cs`: Catálogo central de errores de esa entidad.
- **Componentes Transversales (`Common/`):**
  - `Behaviors/`: Pipeline de MediatR (Logging, UnhandledException, Validation, Transaction).
  - `Exceptions/`: Excepciones de aplicación (`ValidationException`, `NotFoundException`, etc.).
  - `Interfaces/`: Contratos requeridos por la aplicación pero implementados en Infrastructure (`IApplicationDbContext`, `IIdentityService`, `ICurrentUserService`, `ITokenService`).
  - `Models/`: Modelos transversales (`Result`, `Result<T>`, `Error`, `ErrorType`, `PaginatedList<T>`).

### 3. `SGCS.Infrastructure` (Adaptadores de Infraestructura)
- **Responsabilidad:** Comunicación con el mundo exterior: base de datos PostgreSQL, hashing de contraseñas, generación de tokens JWT.
- **Dependencias:** Implementa las interfaces definidas en `SGCS.Application` y `SGCS.Domain`.
- **Contenido:**
  - `Data/ApplicationDbContext.cs`: Contexto de Entity Framework Core con filtros globales para soft-delete.
  - `Data/Configurations/`: Configuraciones de mapeo Fluent API por entidad (`IEntityTypeConfiguration<T>`).
  - `Data/Interceptors/`: Interceptores de EF Core (`SoftDeleteInterceptor`, `AuditableEntityInterceptor`).
  - `Identity/`: Implementación de `IIdentityService` usando ASP.NET Core Identity.
  - `Services/`: Implementación de servicios como `TokenService`.

### 4. `SGCS.API` (Capa de Presentación Web)
- **Responsabilidad:** Exponer los endpoints HTTP y formatear las respuestas.
- **Dependencias:** Referencia a `SGCS.Application` e `SGCS.Infrastructure`.
- **Contenido:**
  - `Controllers/`: Controladores ultralivianos (Skinny Controllers). No contienen lógica de negocio; solo reciben el DTO/Command, lo despachan vía `_mediator.Send()` y retornan `Ok()`, `CreatedAtAction()`, `NoContent()` o `this.ToProblemDetails(result)`.
  - `Middleware/GlobalExceptionHandlerMiddleware.cs`: Capturador global de excepciones no controladas.
  - `Common/ResultExtensions.cs`: Mapeador que traduce un `Result` fallido a `ProblemDetails` estándar (RFC 7807/9457).
  - `Program.cs`: Configuración de inyección de dependencias, CORS, JWT y pipeline HTTP.

---

## 3. Patrones de Diseño Clave

### A. CQRS (Command Query Responsibility Segregation) con MediatR
Separamos conceptualmente las operaciones de lectura de las de escritura:
- **Commands (Escritura):** Modifican el estado del sistema (`CreateProveedorCommand`, `UpdateProveedorCommand`). Retornan `Result` o `Result<TId>` (generalmente el ID generado).
- **Queries (Lectura):** Consultan datos sin alterar el estado (`GetProveedoresQuery`, `GetProveedorByIdQuery`). Utilizan `.AsNoTracking()` para maximizar el rendimiento y retornan DTOs planos o paginados.

**Beneficios:** Desacoplamiento total, clases pequeñas de responsabilidad única (Single Responsibility Principle) y facilidad para agregar validaciones y transacciones de forma modular.

---

### B. Pipeline Behaviors (Patrón Decorator / Cadena de Responsabilidad)
Cada petición enviada a través de `_mediator.Send()` atraviesa una serie de interceptores en orden estricto antes de llegar a su Handler:

```
Petición
   │
   ▼
1. LoggingBehavior             ───► Mide tiempo de ejecución y registra logs informativos.
   │
   ▼
2. UnhandledExceptionBehavior  ───► Detecta fallos no capturados para asegurar logueo.
   │
   ▼
3. ValidationBehavior          ───► Ejecuta FluentValidation. Si hay fallos, lanza ValidationException.
   │
   ▼
4. TransactionBehavior         ───► Abre transacción de base de datos si el Command implementa ITransactionalCommand.
   │
   ▼
5. Handler                     ───► Lógica de negocio específica.
```

- **Si la validación de entrada falla:** Se detiene en el paso 3. Nunca llega a abrir una transacción en base de datos ni ejecuta el Handler.
- **Si el handler retorna un `Result` fallido:** `TransactionBehavior` revierte automáticamente la transacción (`RollbackAsync`) para evitar cambios parciales.

---

### C. Result Pattern con Errores Tipados (Evitando Excepciones para Flujo Normal)
Las excepciones en .NET son costosas computacionalmente y deben reservarse para situaciones *excepcionales* (caída de red, bug de código, disco lleno). Las validaciones de negocio (ej: "el CUIT ya existe", "saldo insuficiente") son bifurcaciones esperadas del flujo.

Implementamos el patrón **Result** artesanal:

```csharp
// Un error tipado contiene código legible por máquina, descripción, categoría y extensiones
public record Error(string Code, string Description, ErrorType Type, Dictionary<string, object?>? Extensions = null);

// Result encapsula si la operación fue exitosa o qué error ocurrió
public class Result { ... }
public class Result<T> : Result { public T Value { get; } }
```

**Categorías de `ErrorType`:**
- `Validation` (400 Bad Request)
- `NotFound` (404 Not Found)
- `Conflict` (409 Conflict)
- `Unauthorized` (401 Unauthorized)
- `Forbidden` (403 Forbidden)
- `Failure` (500 Internal Server Error)

---

### D. Formato Estándar ProblemDetails (RFC 7807 / RFC 9457)
Toda respuesta de error emitida por la API —ya provenga de una excepción imprevista, de FluentValidation o de un `Result` fallido— utiliza el formato estandarizado **`application/problem+json`**:

```json
{
  "type": null,
  "title": "Conflict",
  "status": 409,
  "detail": "El CUIT '20123456789' pertenece al proveedor 'Distribuidora X' que fue dado de baja.",
  "instance": "/api/proveedor",
  "code": "Proveedor.SoftDeletedCuit",
  "existingProveedorId": "0192e2a3-...",
  "nombre": "Distribuidora X",
  "traceId": "00-4bf92f3577b34da6a3ce929d0e0e4736-00"
}
```

**Ventaja estratégica para el Frontend:**
El frontend nunca debe hacer `if (error.detail.includes("CUIT ya existe"))`. En su lugar, lee el campo estable `error.code`:
```typescript
if (error.response?.status === 409 && data?.code === 'Proveedor.SoftDeletedCuit') {
  // Disparar modal de restauración usando data.existingProveedorId
}
```

---

### E. Borrado Lógico (Soft Delete) Automatizado
1. **Interfaz:** Toda entidad con borrado suave implementa `ISoftDeletableEntity`.
2. **Interceptor (`SoftDeleteInterceptor`):** Cuando en EF Core se hace `_context.Proveedores.Remove(entidad)`, el interceptor cambia el estado a `Modified`, asigna `IsDeleted = true`, `DeletedAt = DateTime.UtcNow` y el `UserId` del usuario autenticado.
3. **Filtro Global:** En `ApplicationDbContext.OnModelCreating`, se aplica un filtro automático `e => !e.IsDeleted`. Las consultas normales solo traen registros activos.
4. **Búsquedas incluyendo borrados:** Cuando un Command necesita verificar si un valor único (como un CUIT o UserName) ya existía en un registro borrado, usa `.IgnoreQueryFilters()`.

---

## 4. Diagrama del Flujo de Ejecución de una Petición

```
[ Cliente HTTP (Frontend / Postman) ]
                  │
                  ▼ POST /api/proveedor
      ┌───────────────────────┐
      │     ASP.NET Core      │
      │  Middleware Pipeline  │
      └───────────┬───────────┘
                  │
                  ▼
[ GlobalExceptionHandlerMiddleware ] (try / catch general)
                  │
                  ▼
         [ Authentication ] (Valida JWT)
                  │
                  ▼
          [ Authorization ] (Valida Rol, ej: Admin)
                  │
                  ▼
      [ ProveedorController.Create ]
                  │
                  ▼ _mediator.Send(command)
   ══════════════════════════════════════════════════════
               MediatR Pipeline Behaviors
   ══════════════════════════════════════════════════════
                  │
                  ▼ 1. LoggingBehavior (Mide tiempo)
                  │
                  ▼ 2. UnhandledExceptionBehavior
                  │
                  ▼ 3. ValidationBehavior (FluentValidation)
                  │       ├── ¿Falló regla de contrato?
                  │       │       ▼ SÍ
                  │       │    Lanza ValidationException ──┐
                  │       ▼ NO                             │
                  │                                        │
                  ▼ 4. TransactionBehavior (si aplica)     │
                  │       Abre transacción PostgreSQL      │
                  │                                        │
                  ▼ 5. CreateProveedorCommandHandler       │
                  │       Lógica de negocio                │
                  │       ├── Busca con IgnoreQueryFilters │
                  │       ├── ¿Existe pero borrado?        │
                  │       │       ▼ SÍ                     │
                  │       │    Retorna Result.Failure(     │
                  │       │      ProveedorErrors.Soft...)  │
                  │       ▼ NO                             │
                  │    Guarda entidad en PostgreSQL        │
                  │    Retorna Result.Success(id)          │
                  │                                        │
   ══════════════════════════════════════════════════════  │
                  │                                        │
                  ◄─── TransactionBehavior                 │
                  │    (Commit si éxito / Rollback si fallo)
                  │                                        │
                  ◄─── LoggingBehavior (Registra fin)      │
                  │                                        │
                  ▼                                        │
      [ ProveedorController.Create ]                       │
                  │                                        │
         ¿result.Succeeded?                                │
         ├── SÍ ──► HTTP 201 CreatedAtAction               │
         └── NO ──► this.ToProblemDetails(result)          │
                        │ (HTTP 409 / 404 / 400 Problem)   │
                        ▼                                  │
     [ Respuesta JSON application/problem+json ] ◄─────────┘
```

---

## 5. Resumen de Buenas Prácticas para el Equipo

1. **Controladores Delgados:** Los controladores solo reciben el Request, invocan a MediatR y retornan la respuesta (`Ok`, `NoContent` o `ToProblemDetails`). **Cero lógica de negocio en el Controller**.
2. **Validación de Formato vs Reglas de Negocio:**
   - Longitudes, campos requeridos, regex, emails $\longrightarrow$ **FluentValidation** (`Validator`).
   - Existencia en base de datos, saldo, permisos de estado $\longrightarrow$ **Handlers** mediante **Result Pattern** y catálogos `XErrors`.
3. **Nunca retornar Entidades de Base de Datos hacia la API:** Siempre proyectar y retornar DTOs (`ProveedorDto`, `UserDto`).
4. **Consultas de Lectura siempre con AsNoTracking:** En todas las Queries de MediatR usar `.AsNoTracking()` para no penalizar el ChangeTracker de EF Core.
5. **Errores Tipados:** Nunca escribir strings sueltos en `Result.Failure("error...")`. Utilizar o crear el método correspondiente en `{Entidad}Errors.cs`.
