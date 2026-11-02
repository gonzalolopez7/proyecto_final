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
