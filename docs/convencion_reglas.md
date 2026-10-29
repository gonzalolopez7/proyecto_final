# Criterio de unificación de mensajes de validación

Se estableció una convención uniforme y en español para todos los mensajes de validación:

- **Campos requeridos**: "El/La **[campo]** es obligatorio/a." (e.g. "El nombre de usuario es obligatorio.", "El ID del proveedor es obligatorio.").
- **Longitud máxima**: "El/La **[campo]** no debe superar los **[N]** caracteres."
- **Longitud mínima**: "El/La **[campo]** debe tener al menos **[N]** caracteres."
- **Paginación y rangos**: "La página debe ser mayor o igual a 1.", "El tamaño de página debe ser mayor o igual a 1.", "Los días de pago deben ser mayores o iguales a 0.".
- **Formatos específicos**: "El formato del correo electrónico no es válido.", "El teléfono debe tener 10 dígitos.", "El teléfono solo debe contener dígitos.".
- **Catálogos de errores (*Errors.cs)**: Todos los mensajes están en español consistente manteniendo intactos los códigos semánticos (User.NotFound, Proveedor.CuitAlreadyExists, etc.) para preservar la compatibilidad con el frontend.