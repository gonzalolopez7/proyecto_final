/**
 * Elimina caracteres no numéricos (guiones, puntos, espacios) de un CUIT/CUIL.
 */
export function limpiarCuit(cuit) {
  if (!cuit) return '';
  return String(cuit).replace(/\D/g, '');
}

/**
 * Formatea un CUIT de 11 dígitos con el patrón XX-XXXXXXXX-X.
 */
export function formatearCuit(cuit) {
  if (!cuit) return 'Sin CUIT';
  const soloNumeros = limpiarCuit(cuit);
  if (soloNumeros.length === 11) {
    return `${soloNumeros.slice(0, 2)}-${soloNumeros.slice(2, 10)}-${soloNumeros.slice(10)}`;
  }
  return String(cuit);
}

/**
 * Valida un CUIT o CUIL argentino utilizando el algoritmo de Módulo 11 (dígito verificador).
 * @param {string|number} cuit - CUIT a validar.
 * @returns {boolean} true si el CUIT es matemáticamente válido; false en caso contrario.
 */
export function validarCuit(cuit) {
  const limpio = limpiarCuit(cuit);
  if (limpio.length !== 11) return false;

  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 10; i += 1) {
    suma += parseInt(limpio[i], 10) * factores[i];
  }

  const resto = suma % 11;
  let digitoVerificador = 11 - resto;

  if (digitoVerificador === 11) {
    digitoVerificador = 0;
  } else if (digitoVerificador === 10) {
    return false;
  }

  return digitoVerificador === parseInt(limpio[10], 10);
}

/**
 * Valida que un número telefónico tenga exactamente 10 dígitos numéricos.
 */
export function validarTelefono(telefono) {
  if (!telefono) return false;
  return /^\d{10}$/.test(String(telefono).trim());
}

/**
 * Normaliza un código hexadecimal de 3 o 6 caracteres al formato #RRGGBB de 6 caracteres.
 */
export function expandirHexColor(hex) {
  const limpio = String(hex || '').trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(limpio)) return limpio.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(limpio)) {
    const r = limpio[1];
    const g = limpio[2];
    const b = limpio[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return '#1B3A5C';
}

/**
 * Devuelve un resumen breve de talles de una escala (máximo `maxMuestras` talles de ejemplo)
 * para evitar que escalas extensas desborden selectores o encabezados de modales.
 */
export function resumirTallesEscala(talles = [], maxMuestras = 3) {
  if (!Array.isArray(talles) || talles.length === 0) return '';

  const nombres = talles.map((t) => t?.nombre).filter(Boolean);
  if (nombres.length === 0) return '';

  if (nombres.length <= maxMuestras) {
    return nombres.join(', ');
  }

  const muestras = [];
  for (let i = 0; i < maxMuestras; i += 1) {
    const idx = Math.floor(((i + 0.5) * nombres.length) / maxMuestras);
    muestras.push(nombres[idx]);
  }

  return `${muestras.join(', ')}, ...`;
}

