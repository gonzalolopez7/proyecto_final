# Catálogo de Escalas y Talles Predeterminados

Este documento detalla las escalas de talles y sus valores predefinidos que se cargan automáticamente en el sistema mediante el seeder (`ApplicationDbContextInitialiser`).

Cada producto en el sistema está vinculado a una única **Escala de Talle**, lo que restringe y garantiza que sus variantes solo puedan crearse utilizando los talles correspondientes a dicha escala, manteniendo además un orden visual coherente en el frontend.

---

## Resumen de Escalas

| Escala | Cantidad de Talles | Tipo de Prenda / Uso Habitual |
| :--- | :---: | :--- |
| **Alfabética** | 8 | Remeras, buzos, camperas, camisas unisex/adultos |
| **Numérica** | 11 | Indumentaria formal, ambos, sastrería, vestidos |
| **Pantalones mujer** | 22 | Jeans y pantalones femeninos (Cintura W + Largo L) |
| **Pantalones varón** | 33 | Jeans y pantalones masculinos (Cintura W + Largo L) |
| **Calzado AR/EU** | 25 | Zapatillas, zapatos, botas (numeración argentina/europea con medios puntos) |
| **Talle único** | 1 | Accesorios, gorras, medias, cinturones, mochilas |
| **Total** | **100** | |

---

## Detalle por Escala

### 1. Alfabética
Escala estándar para prendas superiores e informales de adultos.

| Orden | Nombre |
| :---: | :--- |
| 1 | `XS` |
| 2 | `S` |
| 3 | `M` |
| 4 | `L` |
| 5 | `XL` |
| 6 | `2XL` |
| 7 | `3XL` |
| 8 | `4XL` |

---

### 2. Numérica
Escala numérica estándar en números pares desde el 34 hasta el 54.

| Orden | Nombre |
| :---: | :--- |
| 1 | `34` |
| 2 | `36` |
| 3 | `38` |
| 4 | `40` |
| 5 | `42` |
| 6 | `44` |
| 7 | `46` |
| 8 | `48` |
| 9 | `50` |
| 10 | `52` |
| 11 | `54` |

---

### 3. Pantalones mujer
Combinación de cintura (*Waist*: W24 a W34) y largo (*Length*: L30 y L32).

| Orden | Nombre | Orden | Nombre |
| :---: | :--- | :---: | :--- |
| 1 | `W24/L30` | 12 | `W29/L32` |
| 2 | `W24/L32` | 13 | `W30/L30` |
| 3 | `W25/L30` | 14 | `W30/L32` |
| 4 | `W25/L32` | 15 | `W31/L30` |
| 5 | `W26/L30` | 16 | `W31/L32` |
| 6 | `W26/L32` | 17 | `W32/L30` |
| 7 | `W27/L30` | 18 | `W32/L32` |
| 8 | `W27/L32` | 19 | `W33/L30` |
| 9 | `W28/L30` | 20 | `W33/L32` |
| 10 | `W28/L32` | 21 | `W34/L30` |
| 11 | `W29/L30` | 22 | `W34/L32` |

---

### 4. Pantalones varón
Combinación de cintura (*Waist*: W30 a W40) y largo (*Length*: L30, L32 y L34).

| Orden | Nombre | Orden | Nombre | Orden | Nombre |
| :---: | :--- | :---: | :--- | :---: | :--- |
| 1 | `W30/L30` | 12 | `W33/L34` | 23 | `W37/L32` |
| 2 | `W30/L32` | 13 | `W34/L30` | 24 | `W37/L34` |
| 3 | `W30/L34` | 14 | `W34/L32` | 25 | `W38/L30` |
| 4 | `W31/L30` | 15 | `W34/L34` | 26 | `W38/L32` |
| 5 | `W31/L32` | 16 | `W35/L30` | 27 | `W38/L34` |
| 6 | `W31/L34` | 17 | `W35/L32` | 28 | `W39/L30` |
| 7 | `W32/L30` | 18 | `W35/L34` | 29 | `W39/L32` |
| 8 | `W32/L32` | 19 | `W36/L30` | 30 | `W39/L34` |
| 9 | `W32/L34` | 20 | `W36/L32` | 31 | `W40/L30` |
| 10 | `W33/L30` | 21 | `W36/L34` | 32 | `W40/L32` |
| 11 | `W33/L32` | 22 | `W37/L30` | 33 | `W40/L34` |

---

### 5. Calzado AR/EU
Numeración estándar utilizada en Argentina y Europa, con saltos de medio punto (34 a 46).

| Orden | Nombre | Orden | Nombre |
| :---: | :--- | :---: | :--- |
| 1 | `34` | 14 | `40.5` |
| 2 | `34.5` | 15 | `41` |
| 3 | `35` | 16 | `41.5` |
| 4 | `35.5` | 17 | `42` |
| 5 | `36` | 18 | `42.5` |
| 6 | `36.5` | 19 | `43` |
| 7 | `37` | 20 | `43.5` |
| 8 | `37.5` | 21 | `44` |
| 9 | `38` | 22 | `44.5` |
| 10 | `38.5` | 23 | `45` |
| 11 | `39` | 24 | `45.5` |
| 12 | `39.5` | 25 | `46` |
| 13 | `40` | | |

---

### 6. Talle único
Para artículos sin gradación de talle o accesorios.

| Orden | Nombre |
| :---: | :--- |
| 1 | `U` |

