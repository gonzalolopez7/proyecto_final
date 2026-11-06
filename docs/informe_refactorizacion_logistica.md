# Informe de Refactorización: Módulo de Logística (`Deposito`, `Estanteria`, `Ubicacion`)

Este documento resume los cambios aplicados en el backend del módulo de **Logística** con el objetivo de unificar criterios con el resto de los módulos del sistema (**SGCS**) y seguir las reglas definidas en `criterio_configurations.md`, `convencion_reglas.md` y `arquitectura_y_patrones.md`.

---

## 1. Capa de Dominio (`SGCS.Domain`)

### A. Eliminación de `ICollection<T>` y estandarización de propiedades de navegación
En el resto de las entidades del proyecto (`Producto`, `Variante`, `Talle`, `Categoria`, `VarianteProveedor`), las relaciones se definen únicamente desde la entidad que posee la clave foránea (`FK`) mediante una propiedad de navegación nullable (`Entidad?`), sin colecciones `ICollection<T>` en la entidad padre.

- **Archivos modificados:**
  - `Deposito.cs`: Se quitó `ICollection<Estanteria> Estanterias`.
  - `Estanteria.cs`: Se quitó `ICollection<Ubicacion> Ubicaciones` y se cambió `public Deposito Deposito { get; set; } = null!;` por `public Deposito? Deposito { get; set; }`.
  - `Ubicacion.cs`: Se cambiaron `Variante` y `Estanteria` a propiedades nullable (`Variante?`, `Estanteria?`).

### B. Eliminación de la propiedad `Activo` en `Deposito`
- **Motivo:** Todas las entidades del sistema manejan su ciclo de vida (alta/baja/restauración) mediante `ISoftDeletableEntity` (`IsDeleted`). Tener un segundo booleano `Activo` en `Deposito` duplicaba el concepto de baja y generaba inconsistencias (por ejemplo, permitía desactivar un depósito con stock adentro, ocultando sus estanterías).

---

## 2. Capa de Infraestructura (`SGCS.Infrastructure`)

### A. Alineación de Configurations con `criterio_configurations.md`
Se estructuraron `DepositoConfiguration.cs`, `EstanteriaConfiguration.cs` y `UbicacionConfiguration.cs` respetando las secciones estándar:
1. **Longitud de `Deposito.Nombre`:** Se ajustó de `150` a `100` (estándar para nombres de categorías, depósitos y estanterías).
2. **Longitud de `DeletedBy`:** Se agregó `builder.Property(x => x.DeletedBy).HasMaxLength(36);` en `DepositoConfiguration` y `EstanteriaConfiguration` (antes quedaba como tipo `text` ilimitado en PostgreSQL).
3. **Relaciones `.WithMany()`:** Se reemplazó `.WithMany(d => d.Estanterias)` y `.WithMany(e => e.Ubicaciones)` por `.WithMany()`, manteniendo intactas las claves foráneas en la base de datos.

### B. Eliminación de `HasQueryFilter` manuales en las Configurations
- **¿Qué pasaba antes?**
  En `ApplicationDbContext.OnModelCreating`, después de ejecutar `ApplyConfigurationsFromAssembly`, hay un `foreach` que aplica automáticamente `HasQueryFilter(e => !e.IsDeleted)` a todas las entidades `ISoftDeletableEntity`.
  Como EF Core solo admite un `QueryFilter` por entidad, el filtro personalizado que estaba en `EstanteriaConfiguration` (`!e.IsDeleted && !e.Deposito.IsDeleted`) **era sobrescrito silenciosamente** por el del `DbContext`.
- **Solución:** Se delegó el filtro de borrado lógico exclusivamente al `ApplicationDbContext` (igual que en el resto de los módulos), ya que además las reglas de negocio impiden dar de baja un depósito que tenga estanterías activas.

---

## 3. Capa de Aplicación y API (`SGCS.Application` y `SGCS.API`)

### A. Uso de `SoftDeleteInterceptor` al eliminar (`DeleteDepositoCommand` y `DeleteEstanteriaCommand`)

```csharp
// ❌ ANTES: Asignación manual (dejaba DeletedBy siempre en null)
deposito.IsDeleted = true;
deposito.DeletedAt = DateTime.UtcNow;
deposito.DeletedBy = null;

await _context.SaveChangesAsync(cancellationToken);

// ✅ AHORA: Delegado a SoftDeleteInterceptor (registra DeletedAt y el UserId autenticado en DeletedBy)
_context.Depositos.Remove(deposito);
await _context.SaveChangesAsync(cancellationToken);
```

### B. Mensajes de validación en español (`FluentValidation`)
Se agregaron los `.WithMessage(...)` en todos los validadores de `Deposito`, `Estanteria` y `Ubicacion` siguiendo `convencion_reglas.md`:
- *"El nombre del depósito es obligatorio."*
- *"El nombre del depósito no debe superar los 100 caracteres."*
- *"La cantidad debe ser mayor a 0."*

### C. Subconsultas en Queries de `Deposito` y `Estanteria`
Al quitar las colecciones `ICollection` de las entidades, los contadores `CantidadEstanterias`, `CantidadUbicaciones` y `CantidadUnidades` en `GetDepositosQuery.cs` y `GetEstanteriasQuery.cs` ahora se resuelven con subconsultas directas sobre `_context.Estanterias` y `_context.Ubicaciones`.

### D. Separación de `AsignarUbicacionCommand` en `Create`, `Update` y `Delete` + Enriquecimiento de `UbicacionDto`
1. **Por qué se separó `AsignarUbicacionCommand`:**
   - Un único comando *upsert* podía sobrescribir por accidente el stock existente de una variante en una estantería sin avisarle al usuario, y además permitía insertar filas con `Cantidad = 0`.
   - Ahora sigue el estándar CRUD del resto del proyecto:
     - `CreateUbicacionCommand.cs` (`POST /api/Ubicacion`): Exige `Cantidad > 0` y devuelve `409 Conflict` (`Ubicacion.RelationAlreadyExists`) si la variante ya está en esa estantería.
     - `UpdateUbicacionCommand.cs` (`PUT /api/Ubicacion/{id}`): Exige `Cantidad > 0` y actualiza la cantidad de esa ubicación puntual.
     - `DeleteUbicacionCommand.cs` (`DELETE /api/Ubicacion/{id}`): Elimina físicamente la fila cuando una variante se retira de esa estantería.
2. **Enriquecimiento de `UbicacionDto.cs`:**
   - Se agregaron `ProductoNombre`, `TalleNombre`, `ColorNombre` y `ColorCodigoHex` para que el frontend pueda mostrar qué producto, talle y color corresponde a cada SKU ubicado en una estantería.
3. **Rutas estandarizadas en `UbicacionController.cs`:**
   - Se unificaron los nombres de rutas a `GET /api/Ubicacion/by-variante/{idVariante}` y `GET /api/Ubicacion/by-estanteria/{idEstanteria}`, igual que en `VarianteController` y `VarianteProveedorController`.

