const UNIDADES = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
const ESPECIALES = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
const DECENAS = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const CENTENAS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

const FORMATEADOR_ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function convertirSeccion(n) {
  if (n === 0) return '';
  if (n === 100) return 'cien';

  let resultado = '';
  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (c > 0) resultado += `${CENTENAS[c]} `;

  if (d === 1) {
    resultado += `${ESPECIALES[u]} `;
  } else if (d === 2) {
    resultado += u === 0 ? 'veinte ' : `veinti${UNIDADES[u]} `;
  } else if (d > 2) {
    resultado += `${DECENAS[d]}${u > 0 ? ` y ${UNIDADES[u]}` : ''} `;
  } else if (u > 0) {
    resultado += `${UNIDADES[u]} `;
  }

  return resultado.trim();
}

/**
 * Convierte un número decimal a su representación en letras en pesos argentinos.
 */
export function numeroALetras(monto) {
  if (Number.isNaN(Number(monto)) || monto === null || monto === undefined) return '';

  const num = Math.abs(Number(monto));
  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  if (entero === 0) {
    return `cero pesos con ${centavos.toString().padStart(2, '0')}/100`;
  }

  const millones = Math.floor(entero / 1000000);
  const miles = Math.floor((entero % 1000000) / 1000);
  const unidadesPart = entero % 1000;

  let texto = '';

  if (millones > 0) {
    texto += millones === 1 ? 'un millón ' : `${convertirSeccion(millones)} millones `;
  }

  if (miles > 0) {
    texto += miles === 1 ? 'mil ' : `${convertirSeccion(miles)} mil `;
  }

  if (unidadesPart > 0) {
    texto += `${convertirSeccion(unidadesPart)} `;
  }

  texto = `${texto.trim()} pesos`;
  if (centavos > 0) {
    texto += ` con ${centavos.toString().padStart(2, '0')}/100`;
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

/**
 * Formatea un valor numérico como moneda en pesos argentinos (ARS).
 */
export function formatoMoneda(valor) {
  if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '$ 0';
  return FORMATEADOR_ARS.format(Number(valor));
}
