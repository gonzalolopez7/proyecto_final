/**
 * Extrae el mensaje de error desde un ProblemDetails de la API SGCS
 * (definido en ResultExtensions.cs y GlobalExceptionHandlerMiddleware.cs)
 * o desde errores de conexión de red.
 *
 * Estructura devuelta por la API:
 * {
 *   status: number,
 *   title: string,
 *   detail: string,
 *   instance: string,
 *   code: string,
 *   traceId: string,
 *   errors?: Array<{ code, description, type }> | Record<string, string[]>
 * }
 */
export function mensajeDeError(error, porDefecto = 'Ocurrió un error inesperado.') {
  if (!error) return porDefecto;

  // Error de red o servidor apagado (se envió la petición pero no hubo respuesta HTTP)
  if (error.request && !error.response) {
    return 'No se pudo conectar con el servidor. Verificá que la API esté iniciada.';
  }

  const data = error.response?.data;
  if (!data || typeof data !== 'object') {
    return porDefecto;
  }

  // 1. Múltiples errores en ResultExtensions (arreglo de { code, description, type })
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const descriptions = data.errors
      .map((e) => e?.description)
      .filter(Boolean);
    if (descriptions.length > 0) return descriptions.join(' | ');
  }

  // 2. Errores de validación de FluentValidation en GlobalExceptionHandlerMiddleware ({ Campo: ["Error1"] })
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const list = Object.values(data.errors).flat().filter(Boolean);
    if (list.length > 0) return list.join(' | ');
  }

  // 3. Descripción principal del ProblemDetails (error.Description en ResultExtensions)
  if (data.detail) {
    return data.detail;
  }

  return data.title || porDefecto;
}

/**
 * Extrae el código de error de negocio del ProblemDetails (ej: "Auth.InvalidCredentials", "Proveedor.SoftDeletedCuit")
 */
export function codigoDeError(error) {
  return error?.response?.data?.code || null;
}