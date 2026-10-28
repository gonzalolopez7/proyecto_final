# SGCS — Sistema de Gestión Comercial y Stock

Sistema integral de gestión comercial, compras, ventas y control de stock desarrollado con una arquitectura desacoplada y moderna: backend en **.NET 8** bajo **Clean Architecture** (Arquitectura Limpia) y frontend SPA en **React + Vite**.

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías Principales |
| :--- | :--- |
| **Backend** | .NET 8 (C# 12), ASP.NET Core Web API, Entity Framework Core, MediatR (CQRS), FluentValidation, ASP.NET Core Identity, JWT, Swagger / OpenAPI |
| **Frontend** | React 19, Vite, React Router DOM 7, Axios, Lucide React |
| **Base de Datos** | PostgreSQL 17 |
| **Infraestructura** | Docker & Docker Compose |

---

## 📁 Estructura del Repositorio

El repositorio sigue una organización modular dividida en documentación y código fuente (`src`):

```text
api_proyecto_v2/
├── docs/                               # Documentación técnica y guías de arquitectura
│   ├── arquitectura_y_patrones.md      # Detalle técnico de Clean Architecture, CQRS y MediatR
│   └── guia_nuevo_modulo.md            # Paso a paso para implementar nuevos módulos en el backend
├── src/
│   ├── backend/                        # Solución Backend (.NET 8)
│   │   ├── SGCS.sln                    # Solución de Visual Studio / Rider
│   │   ├── SGCS.Domain/                # Entidades puras y reglas de negocio del dominio
│   │   ├── SGCS.Application/           # Casos de uso (CQRS: Features, Commands, Queries)
│   │   ├── SGCS.Infrastructure/        # Persistencia (EF Core, PostgreSQL), Identity y JWT
│   │   ├── SGCS.API/                   # Controladores REST, Middlewares y configuración
│   │   ├── docker-compose.yml          # Contenedor de PostgreSQL para desarrollo local
│   │   └── .env.example                # Variables de entorno para PostgreSQL
│   └── frontend/                       # Aplicación Cliente (React 19 + Vite)
│       ├── src/                        # Componentes, vistas, servicios y hooks
│       ├── package.json                # Dependencias y scripts de npm
│       └── .env.example                # Variables de entorno para Vite (VITE_API_URL)
├── .editorconfig                       # Reglas de estilo de código multiplataforma
├── .gitattributes                      # Normalización de saltos de línea (LF / CRLF)
├── .gitignore                          # Exclusiones de Git (builds, node_modules, .env, OS)
└── README.md                           # Documentación principal del repositorio
```

---

## 🚀 Requisitos Previos

Asegúrate de tener instaladas las siguientes herramientas en tu entorno de desarrollo:

- **[.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)** o superior.
- **[Node.js](https://nodejs.org/)** (versión 18 o superior) y **npm**.
- **[Docker Desktop](https://www.docker.com/products/docker-desktop/)** (para la base de datos PostgreSQL).
- Herramienta de base de datos opcional (DBeaver, pgAdmin) o extensiones de base de datos para tu IDE.

---

## ⚡ Guía de Inicio Rápido

### 1. Clonar el repositorio y configurar variables de entorno

#### Backend:
1. Navega a `src/backend`:
   ```bash
   cd src/backend
   ```
2. Crea el archivo `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```
3. En `src/backend/SGCS.API`, copia las configuraciones de ejemplo si no existen:
   ```bash
   cd SGCS.API
   cp appsettings.example.json appsettings.json
   cp appsettings.Development.example.json appsettings.Development.json
   cd ..
   ```

#### Frontend:
1. Navega a `src/frontend`:
   ```bash
   cd ../frontend
   ```
2. Crea el archivo `.env` a partir del ejemplo:
   ```bash
   cp .env.example .env
   ```

---

### 2. Iniciar la Base de Datos (PostgreSQL)

Desde la carpeta `src/backend/`:
```bash
docker compose up -d
```
Esto levantará el contenedor de PostgreSQL 17 mapeado al puerto `5432`.

---

### 3. Aplicar Migraciones de Base de Datos

1. **Instalar EF Core CLI Tools (si no las tienes instaladas):**
   ```bash
   dotnet tool install --global dotnet-ef
   ```

2. **Aplicar las migraciones a PostgreSQL:**
   Desde la carpeta `src/backend/`, ejecuta:
   ```bash
   dotnet ef database update --project SGCS.Infrastructure --startup-project SGCS.API
   ```

---

### 4. Ejecutar el Backend

Desde `src/backend/`:
```bash
dotnet run --project SGCS.API
```

---

### 5. Ejecutar el Frontend

En una nueva terminal, navega a `src/frontend/`:
```bash
cd src/frontend
npm install
npm run dev
```
La aplicación cliente estará disponible en la URL indicada por Vite.

---

## 📚 Documentación Técnica Detallada

Para comprender a fondo los patrones implementados o agregar nuevas funcionalidades, consulta los documentos de la carpeta `docs/`:

- 📖 **[Arquitectura y Patrones de Diseño](docs/arquitectura_y_patrones.md)**: Explicación de Clean Architecture, Vertical Slice / Features, CQRS con MediatR, Result Pattern, auditoría y soft-delete.
- 🛠️ **[Guía para Nuevos Módulos](docs/guia_nuevo_modulo.md)**: Guía paso a paso para crear una nueva entidad, sus endpoints (Commands/Queries), mapeos, validaciones y migraciones.

---

## 🔒 Variables de Entorno y Seguridad

- **Nunca subas archivos `.env` ni cadenas de conexión con credenciales reales al control de versiones.**
- Todos los secretos sensibles deben mantenerse en archivos ignorados por `.gitignore` y documentarse únicamente en archivos `.env.example` o `appsettings.example.json`.
