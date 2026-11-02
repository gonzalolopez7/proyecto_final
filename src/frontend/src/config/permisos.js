export const ROLES_DISPONIBLES = [
  {
    id: 'Admin',
    nombre: 'Admin',
    etiqueta: 'Administrador',
    detalle: 'Acceso completo al sistema y gestión de usuarios',
  },
  {
    id: 'Encargado',
    nombre: 'Encargado',
    etiqueta: 'Encargado',
    detalle: 'Gestión operativa, compras y proveedores',
  },
  {
    id: 'Comprador',
    nombre: 'Comprador',
    etiqueta: 'Comprador',
    detalle: 'Gestión de órdenes de compra y proveedores',
  },
  {
    id: 'OperadorInventario',
    nombre: 'OperadorInventario',
    etiqueta: 'Operador de inventario',
    detalle: 'Catálogo de productos y conteos de stock',
  },
  {
    id: 'OperadorLogistica',
    nombre: 'OperadorLogistica',
    etiqueta: 'Operador de logística',
    detalle: 'Movimientos de stock y ubicaciones',
  },
];

// null = cualquier usuario autenticado
export const PERMISOS = {
  dashboard: null,
  proveedores: ['Admin', 'Encargado', 'Comprador'],
  usuarios: ['Admin', 'Encargado'],
  productos: ['Admin', 'Encargado', 'OperadorInventario', 'Comprador'],
};

function normalizarClaveRol(rol = '') {
  return String(rol)
    .normalize('NFD')
    .replace(/[\u0300-\u036f\s_-]/g, '')
    .toLowerCase();
}

/**
 * Obtiene la información legible ({ id, nombre, etiqueta, detalle }) de un rol.
 */
export function obtenerInfoRol(nombre = '') {
  if (!nombre) {
    return { id: '', nombre: '', etiqueta: 'Usuario', detalle: '' };
  }

  const clave = normalizarClaveRol(nombre);
  if (clave === 'administrador') {
    return ROLES_DISPONIBLES[0];
  }

  const encontrado = ROLES_DISPONIBLES.find((r) => normalizarClaveRol(r.id) === clave);
  return encontrado || { id: nombre, nombre, etiqueta: nombre, detalle: '' };
}

/**
 * Verifica si el rol del usuario está incluido dentro de la lista de roles permitidos.
 * Si rolesPermitidos es null o vacío, cualquier usuario autenticado tiene acceso.
 */
export function tienePermiso(rolUsuario, rolesPermitidos) {
  if (!rolesPermitidos || rolesPermitidos.length === 0) return true;
  if (!rolUsuario) return false;

  const rolNorm = normalizarClaveRol(rolUsuario);

  return rolesPermitidos.some((permitido) => {
    const pNorm = normalizarClaveRol(permitido);
    return (
      rolNorm === pNorm ||
      (rolNorm === 'admin' && pNorm === 'administrador') ||
      (rolNorm === 'administrador' && pNorm === 'admin')
    );
  });
}
