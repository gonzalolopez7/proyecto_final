// Convierte un número decimal a su representación en letras en pesos argentinos
export function numeroALetras(monto) {
  if (isNaN(monto) || monto === null || monto === undefined) return '';

  const unidades = ['', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  function convertirSeccion(n) {
    if (n === 0) return '';
    if (n === 100) return 'cien';

    let resultado = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) resultado += centenas[c] + ' ';

    if (d === 1) {
      resultado += especiales[u] + ' ';
    } else if (d === 2) {
      if (u === 0) resultado += 'veinte ';
      else resultado += 'veinti' + unidades[u] + ' ';
    } else if (d > 2) {
      resultado += decenas[d] + (u > 0 ? ' y ' + unidades[u] : '') + ' ';
    } else if (u > 0) {
      resultado += unidades[u] + ' ';
    }

    return resultado.trim();
  }

  const num = Math.abs(Number(monto));
  const entero = Math.floor(num);
  const centavos = Math.round((num - entero) * 100);

  if (entero === 0) {
    return `cero pesos con ${centavos.toString().padStart(2, '0')}/100`;
  }

  let millones = Math.floor(entero / 1000000);
  let miles = Math.floor((entero % 1000000) / 1000);
  let unidadesPart = entero % 1000;

  let texto = '';

  if (millones > 0) {
    if (millones === 1) texto += 'un millón ';
    else texto += convertirSeccion(millones) + ' millones ';
  }

  if (miles > 0) {
    if (miles === 1) texto += 'mil ';
    else texto += convertirSeccion(miles) + ' mil ';
  }

  if (unidadesPart > 0) {
    texto += convertirSeccion(unidadesPart) + ' ';
  }

  texto = texto.trim() + ' pesos';
  if (centavos > 0) {
    texto += ` con ${centavos.toString().padStart(2, '0')}/100`;
  }

  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function formatoMoneda(valor) {
  if (valor === null || valor === undefined || isNaN(valor)) return '$ 0';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

