/**
 * Valida un CUIT o CUIL argentino utilizando el algoritmo de Módulo 11 (dígito verificador).
 * @param {string|number} cuit - CUIT a validar (esperado 11 dígitos numéricos sin guiones ni puntos).
 * @returns {boolean} true si el CUIT es matemáticamente válido; false en caso contrario.
 */
export function validarCuit(cuit) {
  if (!cuit) return false;
  const limpio = String(cuit).trim().replace(/[-.\s]/g, '');

  if (limpio.length !== 11 || !/^\d{11}$/.test(limpio)) {
    return false;
  }

  const factores = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let suma = 0;

  for (let i = 0; i < 10; i++) {
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

