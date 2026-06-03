<h1 align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/3081/3081559.png" width="50"/>
  <br/>
  Plataforma Digital para Emprendimientos del ITM
</h1>

<p align="center">
  API RESTful que conecta emprendedores, compradores y administradores<br/>
  dentro del ecosistema del Instituto Tecnológico Metropolitano.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Estado-En%20desarrollo-yellow"/>
  <img src="https://img.shields.io/badge/.NET-8.0-512BD4?logo=dotnet"/>
  <img src="https://img.shields.io/badge/C%23-12-239120?logo=csharp"/>
  <img src="https://img.shields.io/badge/EF%20Core-8.0-512BD4"/>
  <img src="https://img.shields.io/badge/SQL%20Server-LocalDB%20%2F%20Express-CC2927?logo=microsoftsqlserver"/>
  <img src="https://img.shields.io/badge/JWT-Autenticación-000000?logo=jsonwebtokens"/>
  <img src="https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase"/>
  <img src="https://img.shields.io/badge/Swagger-Documentación-85EA2D?logo=swagger"/>
</p>

---

> [!NOTE]
> 👋 Este proyecto es una **API RESTful de backend** construida con **.NET 8** y **Clean Architecture**.  
> No incluye frontend propio. Cualquier cliente externo (web, móvil, Postman, Swagger) puede consumirla.

> [!IMPORTANT]
> Todos los endpoints están protegidos con **JWT Bearer**, excepto `POST /api/Usuarios/registro` y `POST /api/Usuarios/login` y `GET /api/Categorias`.  
> Para acceder a los demás endpoints primero debes registrarte, iniciar sesión y usar el token recibido.

---

## 📋 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Integrantes](#-integrantes)
3. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
4. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
5. [Modelo de Dominio](#-modelo-de-dominio)
6. [Patrones de Diseño Implementados](#-patrones-de-diseño-implementados)
7. [Funcionalidades Implementadas](#-funcionalidades-implementadas)
8. [Requisitos de Instalación](#-requisitos-de-instalación)
9. [Instalación de Paquetes NuGet](#-instalación-de-paquetes-nuget)
10. [Configuración del Proyecto](#-configuración-del-proyecto)
11. [Base de Datos](#-base-de-datos)
12. [Pasos para Ejecutar el Proyecto](#-pasos-para-ejecutar-el-proyecto)
13. [API — Endpoints y Validaciones](#-api--endpoints-y-validaciones)
14. [Manejo Global de Errores](#-manejo-global-de-errores)
15. [Evidencias del MVP](#-evidencias-del-mvp)
16. [Consideraciones Técnicas](#-consideraciones-técnicas)
17. [Mejoras Futuras](#-mejoras-futuras)

---

## 🏪 Descripción General

La **Plataforma Digital para Emprendimientos del ITM** centraliza y digitaliza la gestión de emprendimientos del Instituto Tecnológico Metropolitano. El sistema conecta tres tipos de actores:

| Rol | Descripción |
|---|---|
| **Emprendedor** | Publica y gestiona sus productos, perfil, horarios de atención y ubicaciones físicas |
| **Comprador** | Navega el catálogo de productos activos, puede filtrar por nombre y categoría |
| **Administrador** | Modera el catálogo completo, gestiona categorías y tiene acceso a estadísticas del sistema |

**Problema que resuelve:** Los emprendedores del ITM carecen de un canal digital unificado para publicar sus productos. Los compradores no tienen una forma estructurada de descubrirlos.

**Alcance funcional construido en 4 fases:**

- **Fase 1 —** Estructura de la solución, entidades del dominio, enums, patrón Factory Method, repositorios, DbContext, migración inicial, Swagger.
- **Fase 2 —** Autenticación JWT con BCrypt, DTOs en Application, FluentValidation, AutoMapper, controllers de Usuarios y Categorías.
- **Fase 3 —** Gestión de productos con patrones State, Observer y Strategy, Facade, servicio de imágenes con Supabase, auditoría de cambios.
- **Fase 4 —** Perfiles diferenciados por rol, horarios de atención, ubicaciones físicas, propagación de perfil a productos.

---

## 👥 Integrantes

```
[Evelyn Karina Hoyos Serna]
[Mariana Gomez Orozco]
[Edmar Alejandro Leon Tacoa]
[Juan Diego Cruz Pardo]
```

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Proyecto donde se instala | Propósito |
|---|---|---|---|
| .NET SDK | 8.0 | Todos | Runtime y plataforma base |
| ASP.NET Core Web API | 8.0 | `API` | Framework HTTP y routing |
| Entity Framework Core | 8.0.x | `DataAccess` | ORM Code First |
| EF Core SQL Server | 8.0.x | `DataAccess` | Proveedor de base de datos |
| EF Core Tools | 8.0.x | `DataAccess` | Migraciones desde CLI |
| EF Core Design | 8.0.x | `API` | Soporte de migraciones desde el startup project |
| SQL Server | Express / Developer / LocalDB | Motor externo | Base de datos relacional |
| AutoMapper | Latest | `API` | Mapeo entidades ↔ DTOs |
| Swashbuckle.AspNetCore | Latest | `API` | Swagger UI y documentación OpenAPI |
| JwtBearer | 8.0.x | `API` | Autenticación con tokens JWT |
| BCrypt.Net-Next | Latest | `API` | Hash seguro de contraseñas |
| FluentValidation | Latest | `Application` | Validación declarativa de DTOs |
| FluentValidation.DI Extensions | Latest | `Application` | Registro de validadores en DI |
| Microsoft.Extensions.Logging.Abstractions | Latest | `Application` | Abstracciones de logging |
| Supabase Storage | — | `DataAccess` (HTTP client) | Almacenamiento de imágenes de productos y perfiles |

---

## 🏗️ Arquitectura del Proyecto

La solución sigue **Clean Architecture** estricta con cuatro proyectos independientes. La regla fundamental es que las dependencias apuntan siempre hacia el núcleo (`Domain`), el cual no conoce ninguna tecnología concreta.

### Capas y Responsabilidades

| Proyecto | Capa | Responsabilidad principal |
|---|---|---|
| `ITM.Emprendimientos.API` | Presentación | Controllers, `ErrorHandlingMiddleware`, `MappingProfile`, `Program.cs`, `appsettings.json` |
| `ITM.Emprendimientos.Application` | Aplicación | Services, Facades, DTOs (Requests/Responses), Validators (FluentValidation) |
| `ITM.Emprendimientos.Domain` | Dominio | Entities, Enums, Factories, States, Strategies, Observers, Events, Interfaces de repositorio |
| `ITM.Emprendimientos.DataAccess` | Infraestructura | `AppDbContext`, Repositories, Migrations, `JwtTokenService`, `FotosComponent` (Supabase), `AuditoriaRepository` |

### Regla de Dependencias entre Proyectos

```
API  ──────────────────────────►  Application  ──────►  Domain
 │                                                         ▲
 └──────────────────────────────►  DataAccess  ───────────┘

⚠️  Domain  →  ∅  (no referencia ningún otro proyecto de la solución)
```

Comandos para configurar las referencias:

```bash
# API → Application
dotnet add ITM.Emprendimientos.API/ITM.Emprendimientos.API.csproj \
  reference ITM.Emprendimientos.Application/ITM.Emprendimientos.Application.csproj

# API → DataAccess  (solo para registrar la DI en Program.cs)
dotnet add ITM.Emprendimientos.API/ITM.Emprendimientos.API.csproj \
  reference ITM.Emprendimientos.DataAccess/ITM.Emprendimientos.DataAccess.csproj

# Application → Domain
dotnet add ITM.Emprendimientos.Application/ITM.Emprendimientos.Application.csproj \
  reference ITM.Emprendimientos.Domain/ITM.Emprendimientos.Domain.csproj

# DataAccess → Domain
dotnet add ITM.Emprendimientos.DataAccess/ITM.Emprendimientos.DataAccess.csproj \
  reference ITM.Emprendimientos.Domain/ITM.Emprendimientos.Domain.csproj
```

### Flujo de una Petición HTTP

```
Cliente (Postman / Swagger / app externa)
          │
          ▼
 ┌─────────────────────────────────────────────────────┐
 │  API — Controller                                   │
 │  1. Recibe el DTO del request                       │
 │  2. Ejecuta FluentValidation                        │
 │  3. Extrae claims del JWT (userId, rol)             │
 │  4. Llama al Service o Facade                       │
 └───────────────────┬─────────────────────────────────┘
                     │
                     ▼
 ┌─────────────────────────────────────────────────────┐
 │  Application — Service / Facade                     │
 │  1. Orquesta la lógica de negocio                   │
 │  2. Aplica patrones de dominio (State, Observer…)   │
 │  3. Llama al Repository                             │
 └───────────────────┬─────────────────────────────────┘
                     │
                     ▼
 ┌─────────────────────────────────────────────────────┐
 │  DataAccess — Repository (EF Core)                  │
 │  Ejecuta queries contra SQL Server                  │
 └─────────────────────────────────────────────────────┘
```

### Estructura de Carpetas de la Solución

```
ITM.Emprendimientos/
├── ITM.Emprendimientos.sln
│
├── ITM.Emprendimientos.API/
│   ├── Controllers/
│   │   ├── UsuariosController.cs
│   │   ├── CategoriasController.cs
│   │   ├── ProductosController.cs
│   │   ├── PerfilesController.cs
│   │   ├── HorariosController.cs
│   │   └── UbicacionesController.cs
│   ├── Mappings/
│   │   └── MappingProfile.cs
│   ├── Middlewares/
│   │   └── ErrorHandlingMiddleware.cs
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── Program.cs
│   └── appsettings.json
│
├── ITM.Emprendimientos.Application/
│   ├── DTOs/
│   │   ├── Requests/
│   │   │   ├── RegistroRequest.cs
│   │   │   ├── LoginRequest.cs
│   │   │   ├── CategoriaRequest.cs
│   │   │   ├── CrearProductoRequest.cs
│   │   │   ├── ActualizarProductoRequest.cs
│   │   │   ├── CambiarEstadoRequest.cs
│   │   │   ├── ActualizarPerfilEmprendedorRequest.cs
│   │   │   ├── ActualizarPerfilCompradorRequest.cs
│   │   │   ├── ActualizarPerfilAdminRequest.cs
│   │   │   ├── CrearHorarioRequest.cs
│   │   │   ├── ActualizarHorarioRequest.cs
│   │   │   ├── CrearUbicacionRequest.cs
│   │   │   └── ActualizarUbicacionRequest.cs
│   │   └── Responses/
│   │       ├── AuthResponse.cs
│   │       ├── UsuarioResponse.cs
│   │       ├── CategoriaResponse.cs
│   │       ├── ProductoResponse.cs
│   │       ├── ProductoStatsResponse.cs
│   │       ├── PerfilEmprendedorResponse.cs
│   │       ├── PerfilCompradorResponse.cs
│   │       ├── PerfilAdminResponse.cs
│   │       ├── HorarioResponse.cs
│   │       └── UbicacionResponse.cs
│   ├── Validators/
│   │   ├── RegistroValidator.cs
│   │   ├── LoginValidator.cs
│   │   ├── CategoriaValidator.cs
│   │   ├── CrearProductoValidator.cs
│   │   ├── ActualizarProductoValidator.cs
│   │   ├── CambiarEstadoValidator.cs
│   │   ├── ActualizarPerfilEmprendedorValidator.cs
│   │   ├── ActualizarPerfilCompradorValidator.cs
│   │   ├── ActualizarPerfilAdminValidator.cs
│   │   ├── CrearHorarioValidator.cs
│   │   ├── ActualizarHorarioValidator.cs
│   │   ├── CrearUbicacionValidator.cs
│   │   └── ActualizarUbicacionValidator.cs
│   ├── Services/
│   │   ├── UsuarioService.cs
│   │   ├── CategoriaService.cs
│   │   ├── ProductoService.cs
│   │   ├── ProductoQueryService.cs
│   │   ├── PerfilService.cs
│   │   ├── HorarioService.cs
│   │   └── UbicacionService.cs
│   └── Facades/
│       └── ProductoFacade.cs
│
├── ITM.Emprendimientos.Domain/
│   ├── Entities/
│   │   ├── AuditBase.cs
│   │   ├── Usuario.cs          ← abstracta
│   │   ├── Emprendedor.cs
│   │   ├── Comprador.cs
│   │   ├── Administrador.cs
│   │   ├── Producto.cs
│   │   ├── Categoria.cs
│   │   ├── Horario.cs
│   │   ├── Ubicacion.cs
│   │   └── AuditoriaProducto.cs
│   ├── Enums/
│   │   ├── TipoUsuario.cs
│   │   ├── EstadoProducto.cs
│   │   └── DiaSemana.cs
│   ├── Factories/
│   │   └── UsuariosFactory.cs
│   ├── States/
│   │   ├── IProductoEstado.cs
│   │   ├── ActivoState.cs
│   │   ├── InactivoState.cs
│   │   ├── EliminadoState.cs
│   │   └── ProductoStateFactory.cs
│   ├── Strategies/
│   │   ├── IProductoFiltroStrategy.cs
│   │   ├── FiltroPorNombre.cs
│   │   ├── FiltroPorCategoria.cs
│   │   └── ProductoFiltroStrategySelector.cs
│   ├── Observers/
│   │   ├── IObservadorProducto.cs
│   │   ├── CatalogoObserver.cs
│   │   └── AuditoriaObserver.cs
│   ├── Events/
│   │   └── ProductoEstadoCambiadoEvent.cs
│   └── Interfaces/
│       ├── IFotosService.cs
│       └── Repositories/
│           ├── IGenericRepository.cs
│           ├── IUsuarioRepository.cs
│           ├── IProductoRepository.cs
│           ├── ICategoriaRepository.cs
│           ├── IHorarioRepository.cs
│           ├── IUbicacionRepository.cs
│           └── IAuditoriaRepository.cs
│
├── ITM.Emprendimientos.DataAccess/
│   ├── Context/
│   │   └── AppDbContext.cs
│   ├── Repositories/
│   │   ├── GenericRepository.cs
│   │   ├── UsuarioRepository.cs
│   │   ├── ProductoRepository.cs
│   │   ├── CategoriaRepository.cs
│   │   ├── HorarioRepository.cs
│   │   ├── UbicacionRepository.cs
│   │   └── AuditoriaRepository.cs
│   ├── Security/
│   │   └── JwtTokenService.cs
│   ├── ExternalServices/
│   │   └── FotosComponent.cs       ← implementa IFotosService con Supabase
│   └── Migrations/
│       └── ..._InitialCreate.cs    ← generado por EF Core
│
└── tests/
    └── ITM.Emprendimientos.Domain.Tests/   ← (implementar en futuras fases)
```

---

## 🗃️ Modelo de Dominio

### Clase Base

```
AuditBase  (abstracta)
  ├── Id          : Guid  = Guid.NewGuid()
  ├── CreadoEn    : DateTime = DateTime.UtcNow
  └── ActualizadoEn : DateTime?
```

### Jerarquía de Usuarios — Table Per Hierarchy (TPH)

```
Usuario  (abstracta : AuditBase)
  ├── Nombre        : string
  ├── Email         : string   [índice único]
  ├── PasswordHash  : string
  ├── Tipo          : TipoUsuario  [discriminador TPH]
  └── Habilitado    : bool = true
        │
        ├── Emprendedor
        │     ├── NombreEmprendimiento : string  [máx 100]
        │     ├── Descripcion          : string  [máx 500]
        │     ├── FotoUrl              : string? [máx 1000]
        │     ├── Productos            : ICollection<Producto>
        │     ├── Horarios             : ICollection<Horario>
        │     └── Ubicaciones          : ICollection<Ubicacion>
        │
        ├── Comprador
        │     ├── Apodo   : string? [máx 50]
        │     ├── SobreTi : string? [máx 300]
        │     └── FotoUrl : string? [máx 1000]
        │
        └── Administrador
              ├── Descripcion : string? [máx 300]
              └── FotoUrl     : string? [máx 1000]
```

> Toda la jerarquía se almacena en una sola tabla `Usuarios` con la columna `Tipo` como discriminador. Esto evita JOINs costosos en las consultas de autenticación.

### Otras Entidades

| Entidad | Campos relevantes | Relaciones |
|---|---|---|
| `Categoria` | `Nombre` [máx 100, único], `Descripcion` [máx 300] | 1 → N con `Producto` |
| `Producto` | `Nombre` [máx 80], `Descripcion` [máx 500], `Precio` [decimal 18,2], `ImagenUrl`, `Estado` (enum), `AdminDisabled` (bool) | N → 1 `Categoria` (Restrict), N → 1 `Emprendedor` (Cascade) |
| `Horario` | `Dia` (enum DiaSemana), `HoraApertura` (TimeOnly), `HoraCierre` (TimeOnly), `Sede` [máx 100] | N → 1 `Emprendedor` (Cascade) |
| `Ubicacion` | `NombreSede` [máx 100], `Descripcion` [máx 300], `ReferenciaMapa` [máx 500] | N → 1 `Emprendedor` (Cascade) |
| `AuditoriaProducto` | `ProductoId`, `NombreProducto`, `EstadoAnterior`, `NuevoEstado`, `ResponsableEmail`, `Motivo`, `OcurridoEn` | Registro histórico inmutable |

### Enums

| Enum | Valores |
|---|---|
| `TipoUsuario` | `Administrador = 0`, `Emprendedor = 1`, `Comprador = 2` |
| `EstadoProducto` | `Activo = 0`, `Inactivo = 1`, `Eliminado = 2` |
| `DiaSemana` | `Lunes = 0`, `Martes = 1`, `Miercoles = 2`, `Jueves = 3`, `Viernes = 4`, `Sabado = 5`, `Domingo = 6` |

---

## 🧩 Patrones de Diseño Implementados

### Factory Method — `UsuariosFactory`

Centraliza la creación de usuarios en `Domain/Factories/`. El `UsuarioService` nunca instancia `Emprendedor`, `Comprador` ni `Administrador` directamente: solo invoca `UsuariosFactory.Crear(tipo, nombre, email, hash)`. Agregar un nuevo rol significa crear una nueva subclase de `Usuario` y registrarla en la factory, sin modificar el servicio (principio OCP).

### State — Ciclo de vida de Producto

Implementado en `Domain/States/`. Cada producto delega sus transiciones al estado actual:

```
Activo  ──► Inactivo  (Ocultar)
Activo  ──► Eliminado (Eliminar)
Inactivo ──► Activo   (Activar)
Inactivo ──► Eliminado (Eliminar)
Eliminado ──► [ninguna transición permitida]
```

Los métodos `Activar()`, `Ocultar()` y `Eliminar()` se llaman sobre la entidad `Producto` y el estado concreto decide si la transición es válida o lanza excepción.

### Observer — Notificaciones de cambio de estado

Implementado en `Domain/Observers/`. Cuando `ProductoService.CambiarEstadoAsync()` completa un cambio de estado, publica un `ProductoEstadoCambiadoEvent` y notifica a todos los observadores registrados:

- **`CatalogoObserver`** — actualiza la visibilidad del producto en el catálogo.
- **`AuditoriaObserver`** — persiste el registro en la tabla `AuditoriaProducto` vía `IAuditoriaRepository`.

### Strategy — Filtrado del catálogo

Implementado en `Domain/Strategies/`. `ProductoQueryService` usa `ProductoFiltroStrategySelector` para elegir la estrategia correcta según los parámetros de la request:

- **`FiltroPorNombre`** — cuando se envía el query param `busqueda`.
- **`FiltroPorCategoria`** — cuando se envía `categoriaId`.

### Facade — `ProductoFacade`

Simplifica la operación de **creación de un producto**: valida que la categoría exista, sube la imagen a Supabase (si se envía), persiste el producto y retorna el `ProductoResponse` con los datos completos (incluyendo nombre de categoría y datos del vendedor).

### Repository Pattern

`IGenericRepository<T>` define las operaciones CRUD comunes (`ObtenerPorIdAsync`, `ObtenerTodosAsync`, `AgregarAsync`, `ActualizarAsync`, `EliminarAsync`). Cada entidad tiene además su propia interfaz con métodos especializados. La capa Application nunca referencia EF Core directamente.

---

## ✅ Funcionalidades Implementadas

### Fase 1 — Núcleo del dominio

- Solución multi-proyecto con Clean Architecture.
- Entidades base con `AuditBase` (Id Guid, CreadoEn, ActualizadoEn).
- Jerarquía de usuarios abstracta con herencia TPH.
- Enums `TipoUsuario`, `EstadoProducto`, `DiaSemana`.
- Interfaces de repositorio en el dominio.
- `UsuariosFactory` con patrón Factory Method.
- `AppDbContext` con todas las relaciones, constraints e índices.
- Repositorios concretos (Generic + específicos).
- `ErrorHandlingMiddleware` centralizado.
- JWT configurado en `Program.cs`.
- Migración `InitialCreate` con seed de 5 categorías.
- Swagger UI con autenticación Bearer.

### Fase 2 — Autenticación y primeros controllers

- `UsuarioService`: registro con BCrypt y login con JWT.
- `JwtTokenService`: genera token con claims `sub`, `email`, `role`, `nombre`, `jti`.
- `CategoriaService`: CRUD completo.
- DTOs de Request y Response en la capa `Application`.
- Validadores FluentValidation para registro, login y categorías.
- `MappingProfile` con AutoMapper en la capa `API`.
- `UsuariosController`: `POST /registro`, `POST /login`.
- `CategoriasController`: `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}`.

### Fase 3 — Gestión de productos

- Patrones State, Observer y Strategy en el dominio.
- `AuditoriaProducto` como entidad de registro histórico.
- `FotosComponent` como adaptador de Supabase (implementa `IFotosService`).
- `ProductoService`: actualizar producto, cambiar estado con notificación a observers.
- `ProductoQueryService`: catálogo filtrado (comprador), admin, mis-productos, estadísticas, detalle.
- `ProductoFacade`: orquesta la creación de productos.
- `ProductosController` con los 8 endpoints del módulo.
- Flag `AdminDisabled` para diferenciar desactivación por admin vs. por emprendedor.
- Soft delete: `EstadoProducto.Eliminado` nunca borra registros de la BD.

### Fase 4 — Perfiles, horarios y ubicaciones

- `PerfilService`: obtener perfil genérico, actualizar por rol con subida de foto a Supabase, propagación de datos del emprendedor a sus productos activos.
- `HorarioService`: CRUD con verificación de ownership.
- `UbicacionService`: CRUD con verificación de ownership.
- Validadores de perfil, horarios y ubicaciones con límites exactos.
- `PerfilesController`: perfil propio, perfil público, actualizar por rol.
- `HorariosController`: listar por emprendedor, crear, actualizar, eliminar.
- `UbicacionesController`: listar por emprendedor, crear, actualizar, eliminar.

---

## ⚙️ Requisitos de Instalación

| Herramienta | Versión | Enlace |
|---|---|---|
| .NET SDK | 8.x | https://dotnet.microsoft.com/download |
| SQL Server | Express / Developer / LocalDB | https://www.microsoft.com/sql-server |
| EF Core Tools CLI | 8.x | `dotnet tool install --global dotnet-ef` |
| Visual Studio 2022 o VS Code | Última estable | Con extensión C# / Dev Kit |
| SQL Server Management Studio | Opcional | Para inspeccionar la base de datos |

---

## 📦 Instalación de Paquetes NuGet

Ejecutar **desde la raíz de la solución**, en el orden indicado:

### Proyecto `ITM.Emprendimientos.DataAccess`

```bash
cd ITM.Emprendimientos.DataAccess

dotnet add package Microsoft.EntityFrameworkCore        -v 8.0.*
dotnet add package Microsoft.EntityFrameworkCore.SqlServer -v 8.0.*
dotnet add package Microsoft.EntityFrameworkCore.Tools  -v 8.0.*

cd ..
```

### Proyecto `ITM.Emprendimientos.API`

```bash
cd ITM.Emprendimientos.API

dotnet add package Microsoft.EntityFrameworkCore.Design -v 8.0.*
dotnet add package AutoMapper.Extensions.Microsoft.DependencyInjection
dotnet add package Swashbuckle.AspNetCore
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer -v 8.0.*
dotnet add package BCrypt.Net-Next

cd ..
```

### Proyecto `ITM.Emprendimientos.Application`

```bash
cd ITM.Emprendimientos.Application

dotnet add package FluentValidation
dotnet add package FluentValidation.DependencyInjectionExtensions
dotnet add package Microsoft.Extensions.Logging.Abstractions

cd ..
```

> [!NOTE]
> `Microsoft.EntityFrameworkCore.Design` se instala en el proyecto **API** porque es el _startup project_ desde el cual se ejecutan los comandos `dotnet ef migrations` y `dotnet ef database update`.

---

## 🔧 Configuración del Proyecto

### `ITM.Emprendimientos.API/appsettings.json`

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=ITM_EmprendimientosDb;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "ITM_SuperSecretKey_2026_Emprendimientos_JWT_32chars!",
    "Issuer": "ITM.Emprendimientos.API",
    "Audience": "ITM.Emprendimientos.Web",
    "ExpirationHours": 2
  },
  "Frontend": {
    "Url": "http://localhost:5500"
  },
  "Supabase": {
    "Url": "https://TU_PROYECTO.supabase.co",
    "Key": "[PENDIENTE: clave de API de Supabase]",
    "BucketName": "productos-fotos"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

> [!WARNING]
> **Nunca subir este archivo con claves reales al repositorio.**  
> Para desarrollo local, usar **User Secrets** de .NET:
> ```bash
> dotnet user-secrets init --project ITM.Emprendimientos.API
> dotnet user-secrets set "Jwt:Key"       "tu_clave_secreta_real_aqui"
> dotnet user-secrets set "Supabase:Key"  "tu_supabase_key_aqui"
> ```
> En producción usar variables de entorno o Azure Key Vault.

### `ITM.Emprendimientos.API/Properties/launchSettings.json`

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "http://localhost:5011",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "https": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": true,
      "launchUrl": "swagger",
      "applicationUrl": "https://localhost:7011;http://localhost:5011",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### CORS

La política `FrontendPolicy` permite peticiones desde `http://localhost:5500` y `http://127.0.0.1:5500`. Se configura en `Program.cs` usando el valor `Frontend:Url` del `appsettings.json`.

### JWT — Claims incluidos en el token

| Claim | Valor | Uso |
|---|---|---|
| `sub` | `usuario.Id` (Guid) | Identificar el usuario en cada request autenticado |
| `email` | `usuario.Email` | Registrar responsables en auditoría |
| `role` | `usuario.Tipo.ToString()` | Autorización por rol en los controllers |
| `nombre` | `usuario.Nombre` | Información de display |
| `jti` | `Guid.NewGuid()` | Identificador único de token |

---

## 🗄️ Base de Datos

**Motor:** SQL Server (Express, Developer Edition o LocalDB)  
**Estrategia:** Entity Framework Core 8 — Code First  
**Herencia:** Table Per Hierarchy (TPH) en la tabla `Usuarios`

### Tablas generadas por la migración `InitialCreate`

| Tabla | Descripción |
|---|---|
| `Usuarios` | Almacena Emprendedores, Compradores y Administradores. Columna `Tipo` como discriminador TPH. Índice único en `Email`. |
| `Categorias` | Clasificación de productos. Índice único en `Nombre`. **5 filas seed.** |
| `Productos` | Columnas `Estado` (int), `AdminDisabled` (bit). FK a `Categorias` (Restrict) y a `Usuarios` (Cascade). |
| `Horarios` | FK a `Usuarios` con OnDelete Cascade. Ordenados por `Dia`. |
| `Ubicaciones` | FK a `Usuarios` con OnDelete Cascade. |
| `AuditoriaProducto` | Registro histórico inmutable de transiciones de estado. Agregada en Fase 3. |

### Seed automático de categorías

Las siguientes 5 categorías se insertan con la migración `InitialCreate` con GUIDs fijos:

| Id (prefijo) | Nombre |
|---|---|
| `a1b2c3d4-0001-…` | Comidas y Bebidas |
| `a1b2c3d4-0002-…` | Ropa y Accesorios |
| `a1b2c3d4-0003-…` | Tecnología |
| `a1b2c3d4-0004-…` | Arte y Manualidades |
| `a1b2c3d4-0005-…` | Servicios |

---

## 🚀 Pasos para Ejecutar el Proyecto

### Paso 1 — Clonar el repositorio

```bash
git clone [PENDIENTE: URL del repositorio]
cd ITM.Emprendimientos
```

### Paso 2 — Restaurar dependencias

```bash
dotnet restore
```

### Paso 3 — Configurar la cadena de conexión

Editar `ITM.Emprendimientos.API/appsettings.json` con los datos de tu instancia de SQL Server. Para LocalDB usar:

```
Server=(localdb)\\mssqllocaldb;Database=ITM_EmprendimientosDb;Trusted_Connection=True;
```

### Paso 4 — Aplicar la migración y crear la base de datos

```bash
# Desde la raíz de la solución
dotnet ef database update \
  --project ITM.Emprendimientos.DataAccess \
  --startup-project ITM.Emprendimientos.API
```

En **Package Manager Console** (Visual Studio):

```
Update-Database -Project ITM.Emprendimientos.DataAccess -StartupProject ITM.Emprendimientos.API
```

### Paso 5 — Ejecutar la API

```bash
cd ITM.Emprendimientos.API
dotnet run
```

### Paso 6 — Verificar en el navegador

Abrir: `https://localhost:7011/swagger`

La interfaz de Swagger debe mostrar el título **"ITM Emprendimientos API v1"** con el botón **Authorize** para ingresar el JWT.

### Verificaciones esperadas tras la puesta en marcha

| Verificación | Resultado esperado |
|---|---|
| `dotnet build` sin errores | ✅ Todos los proyectos compilan |
| `dotnet ef database update` | ✅ Base de datos `ITM_EmprendimientosDb` creada |
| Tabla `Usuarios` en SQL Server | ✅ Columna discriminadora `Tipo` presente |
| Tabla `Productos` | ✅ Columnas `Estado` (int) y `AdminDisabled` (bit) |
| Tabla `Categorias` | ✅ 5 filas de seed insertadas |
| `GET https://localhost:7011/` | ✅ Redirige a `/swagger` |
| Swagger UI | ✅ Carga correctamente con botón Authorize |

### Crear una nueva migración (solo al modificar el modelo)

```bash
dotnet ef migrations add NombreDeLaMigracion \
  --project ITM.Emprendimientos.DataAccess \
  --startup-project ITM.Emprendimientos.API
```

---

## 📡 API — Endpoints y Validaciones

> [!NOTE]
> **Cómo autenticarse en Swagger:**
> 1. Ejecutar `POST /api/Usuarios/registro` o `POST /api/Usuarios/login`.
> 2. Copiar el valor del campo `token` de la respuesta.
> 3. Hacer clic en el botón **Authorize** en la parte superior de Swagger UI.
> 4. Ingresar: `Bearer {token}` y confirmar.

---

### 🔐 Módulo de Autenticación — `/api/Usuarios`

---

#### `POST /api/Usuarios/registro`

Registra un nuevo usuario. Internamente hashea la contraseña con BCrypt, instancia el tipo correcto mediante `UsuariosFactory` y retorna un JWT listo para usar.

**Acceso:** Público — no requiere token.  
**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "nombre": "Ana Gómez",
  "email": "ana@itm.edu.co",
  "password": "clave123",
  "tipoUsuario": 1
}
```

**Valores válidos para `tipoUsuario`:** `0` = Administrador · `1` = Emprendedor · `2` = Comprador

**Validaciones aplicadas — `RegistroValidator` (FluentValidation):**

| Campo | Regla | Error retornado |
|---|---|---|
| `nombre` | Obligatorio | `"El nombre es obligatorio."` |
| `nombre` | Mínimo 2 caracteres | `"El nombre debe tener al menos 2 caracteres."` |
| `email` | Obligatorio | `"El email es obligatorio."` |
| `email` | Formato de email válido | `"El email no tiene un formato válido."` |
| `password` | Obligatorio | `"La contraseña es obligatoria."` |
| `password` | Mínimo 6 caracteres | `"La contraseña debe tener al menos 6 caracteres."` |
| `tipoUsuario` | Entre 0 y 2 inclusive | `"TipoUsuario debe ser 0 (Admin), 1 (Emprendedor) o 2 (Comprador)."` |

**Validación de negocio:** Si el email ya está registrado → `500 Internal Server Error` con mensaje `"El email '{email}' ya está registrado."` (manejado por `ErrorHandlingMiddleware` como `InvalidOperationException`).

**Respuesta exitosa `201 Created`:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuarioId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "nombre": "Ana Gómez",
  "email": "ana@itm.edu.co",
  "rol": "Emprendedor",
  "expiracion": "2026-01-01T04:00:00Z"
}
```

**Respuestas de error:**

| Código | Cuándo ocurre |
|---|---|
| `400 Bad Request` | Fallo de validación FluentValidation. Body: `{ "errors": ["mensaje1", "mensaje2"] }` |
| `409 Conflict` | Email ya registrado en la base de datos |

---

#### `POST /api/Usuarios/login`

Autentica un usuario existente y retorna un JWT.

**Acceso:** Público — no requiere token.  
**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "email": "ana@itm.edu.co",
  "password": "clave123"
}
```

**Validaciones aplicadas — `LoginValidator` (FluentValidation):**

| Campo | Regla | Error retornado |
|---|---|---|
| `email` | Obligatorio | `"El email es obligatorio."` |
| `email` | Formato de email válido | `"Formato de email inválido."` |
| `password` | Obligatorio | `"La contraseña es obligatoria."` |

**Validaciones de negocio en `UsuarioService.LoginAsync`:**

| Condición | Código HTTP | Mensaje |
|---|---|---|
| Email no existe en la BD | `403 Forbidden` | `"Credenciales incorrectas."` |
| Cuenta con `Habilitado = false` | `403 Forbidden` | `"La cuenta está deshabilitada. Contacta al administrador."` |
| Contraseña no coincide con hash BCrypt | `403 Forbidden` | `"Credenciales incorrectas."` |

**Respuesta exitosa `200 OK`:** mismo esquema que `/registro`.

**Respuestas de error:**

| Código | Cuándo ocurre |
|---|---|
| `400 Bad Request` | Fallo de validación FluentValidation |
| `403 Forbidden` | Credenciales incorrectas o cuenta deshabilitada |

---

### 🗂️ Módulo de Categorías — `/api/Categorias`

---

#### `GET /api/Categorias`

Lista todas las categorías con el conteo de productos de cada una.

**Acceso:** Público — no requiere token.

**Respuesta exitosa `200 OK`:**

```json
[
  {
    "id": "a1b2c3d4-0001-0000-0000-000000000000",
    "nombre": "Comidas y Bebidas",
    "descripcion": null,
    "totalProductos": 3
  }
]
```

---

#### `GET /api/Categorias/{id}`

Obtiene una categoría específica por su GUID.

**Acceso:** Público.  
**Parámetro de ruta:** `id` (Guid)

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `200 OK` | `CategoriaResponse` encontrado |
| `404 Not Found` | Body: `{ "message": "Categoría con Id '{id}' no encontrada." }` |

---

#### `POST /api/Categorias`

Crea una nueva categoría.

**Acceso:** Solo rol `Administrador` — requiere JWT.  
**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "nombre": "Papelería",
  "descripcion": "Útiles escolares y de oficina"
}
```

**Validaciones aplicadas — `CategoriaValidator` (FluentValidation):**

| Campo | Regla | Error retornado |
|---|---|---|
| `nombre` | Obligatorio | `"El nombre de la categoría es obligatorio."` |
| `nombre` | Máximo 100 caracteres | `"El nombre no puede superar 100 caracteres."` |
| `descripcion` | Máximo 300 caracteres (solo si no es `null`) | `"La descripción no puede superar 300 caracteres."` |

**Validación de negocio:** Si ya existe una categoría con el mismo nombre (case-insensitive) → `409 Conflict` con mensaje `"Ya existe una categoría con el nombre '{nombre}'."`.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `201 Created` | Categoría creada. Header `Location` apunta a `GET /api/Categorias/{id}` |
| `400 Bad Request` | Fallo de validación |
| `401 Unauthorized` | Token ausente o inválido |
| `403 Forbidden` | Rol distinto de Administrador |
| `409 Conflict` | Nombre duplicado |

---

#### `PUT /api/Categorias/{id}`

Actualiza nombre y/o descripción de una categoría existente.

**Acceso:** Solo `Administrador`.  
**Body:** igual que `POST /api/Categorias`.  
**Validaciones:** idénticas a las del `POST`.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `204 No Content` | Actualización exitosa |
| `400 Bad Request` | Fallo de validación |
| `404 Not Found` | Categoría no encontrada |

---

#### `DELETE /api/Categorias/{id}`

Elimina físicamente una categoría.

**Acceso:** Solo `Administrador`.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `204 No Content` | Eliminación exitosa |
| `404 Not Found` | Categoría no encontrada |

---

### 📦 Módulo de Productos — `/api/Productos`

---

#### `GET /api/Productos`

Catálogo de productos activos y no deshabilitados por el admin, con filtros opcionales.

**Acceso:** Solo rol `Comprador`.  
**Query params opcionales:** `busqueda` (string), `categoriaId` (Guid)

**Comportamiento de filtrado (patrón Strategy):**
- Sin parámetros → retorna todos los productos `Activo` con `AdminDisabled = false`.
- Con `busqueda` → aplica `FiltroPorNombre` (contains, case-insensitive).
- Con `categoriaId` → aplica `FiltroPorCategoria`.
- Ambos parámetros pueden combinarse en el repositorio antes del filtrado en memoria.

**Respuesta exitosa `200 OK`:** arreglo de `ProductoResponse`.

```json
[
  {
    "id": "...",
    "nombre": "Empanadas de pipián",
    "descripcion": "Receta casera",
    "precio": 3500.00,
    "imagenUrl": "https://...",
    "estado": "Activo",
    "adminDisabled": false,
    "categoriaId": "...",
    "categoriaNombre": "Comidas y Bebidas",
    "vendedorId": "...",
    "vendedorNombre": "Sabores del ITM",
    "vendedorDescripcion": "Emprendimiento gastronómico",
    "vendedorFotoUrl": "https://...",
    "vendedorEmail": "sabores@itm.edu.co",
    "creadoEn": "2026-01-15T10:00:00Z"
  }
]
```

**Respuestas de error:**

| Código | Cuándo ocurre |
|---|---|
| `401 Unauthorized` | Token ausente o inválido |
| `403 Forbidden` | Rol distinto de Comprador |

---

#### `GET /api/Productos/admin`

Panel del administrador: todos los productos excepto los `Eliminado`, con filtros.

**Acceso:** Solo `Administrador`.  
**Query params opcionales:** `busqueda`, `categoriaId`  
**Ordenamiento:** por `CreadoEn` descendente.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `200 OK` | Arreglo de `ProductoResponse` (activos e inactivos, nunca eliminados) |
| `403 Forbidden` | Rol distinto de Administrador |

---

#### `GET /api/Productos/mis-productos`

Lista los productos del emprendedor autenticado (activos e inactivos; **nunca eliminados**).

**Acceso:** Solo `Emprendedor`.  
El `emprendedorId` se extrae automáticamente del claim `sub` del JWT.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `200 OK` | Arreglo de `ProductoResponse` del emprendedor, ordenados por `CreadoEn` desc |
| `403 Forbidden` | Rol distinto de Emprendedor |

---

#### `GET /api/Productos/estadisticas`

Estadísticas globales para el panel del administrador.

**Acceso:** Solo `Administrador`.

**Respuesta exitosa `200 OK`:**

```json
{
  "total": 42,
  "activos": 35,
  "inactivos": 7
}
```

> **Nota:** `total` excluye los eliminados; representa activos + inactivos.

---

#### `GET /api/Productos/{id}`

Detalle completo de un producto, incluyendo datos completos del vendedor.

**Acceso:** Cualquier usuario autenticado.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `200 OK` | `ProductoResponse` completo |
| `401 Unauthorized` | Sin token |
| `404 Not Found` | Body: `{ "message": "Producto con Id '{id}' no encontrado." }` |

---

#### `POST /api/Productos`

Crea un nuevo producto. El `EmprendedorId` se toma del claim `sub` del JWT, nunca del body.

**Acceso:** Solo `Emprendedor`.  
**Content-Type:** `multipart/form-data`

**Campos del formulario:**

| Campo | Tipo | Requerido |
|---|---|---|
| `nombre` | string | ✅ |
| `descripcion` | string | ✅ |
| `precio` | decimal | ✅ |
| `categoriaId` | Guid | ✅ |
| `imagen` | IFormFile | ❌ opcional |

**Validaciones aplicadas — `CrearProductoValidator` (FluentValidation):**

| Campo | Regla | Error retornado |
|---|---|---|
| `nombre` | Obligatorio | `"El nombre es obligatorio."` |
| `nombre` | Máximo 80 caracteres | `"El nombre no puede superar 80 caracteres."` |
| `descripcion` | Obligatorio | `"La descripción es obligatoria."` |
| `descripcion` | Máximo 500 caracteres | `"La descripción no puede superar 500 caracteres."` |
| `precio` | Mayor que 0 | `"El precio debe ser mayor a 0."` |
| `categoriaId` | Obligatorio (no Empty) | `"Debe seleccionar una categoría."` |
| `imagen.Length` | ≤ 5 MB (si se adjunta) | `"La imagen no puede superar 5 MB."` |
| `imagen.ContentType` | `image/jpeg`, `image/png` o `image/webp` (si se adjunta) | `"Solo se permiten imágenes JPEG, PNG o WebP."` |

**Validación de negocio en `ProductoFacade`:** si el `categoriaId` no existe en la BD → `404 Not Found` con mensaje `"Categoría con Id '{id}' no encontrada."`.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `201 Created` | Producto creado. Header `Location` apunta a `GET /api/Productos/{id}`. Body: `ProductoResponse` |
| `400 Bad Request` | Fallo de validación. Body: `{ "errors": ["..."] }` |
| `403 Forbidden` | Rol distinto de Emprendedor |
| `404 Not Found` | Categoría no encontrada |

---

#### `PUT /api/Productos/{id}`

Actualiza un producto existente. Solo puede hacerlo el emprendedor propietario y solo si el producto **no está deshabilitado por el administrador** (`AdminDisabled = false`).

**Acceso:** Solo `Emprendedor`.  
**Content-Type:** `multipart/form-data`

**Campos del formulario:** idénticos a `POST /api/Productos`.

**Validaciones aplicadas — `ActualizarProductoValidator`:** idénticas a `CrearProductoValidator`.

**Validaciones de negocio en `ProductoService.ActualizarAsync`:**

| Condición | Código HTTP | Mensaje |
|---|---|---|
| Producto no encontrado | `404 Not Found` | `"Producto con Id '{id}' no encontrado."` |
| `producto.EmprendedorId ≠ emprendedorId` del JWT | `403 Forbidden` | `"No tienes permiso para editar este producto."` |
| `producto.AdminDisabled = true` | `409 Conflict` | `"Este producto fue deshabilitado por el administrador y no puede editarse."` |

Si se envía nueva imagen: la imagen anterior en Supabase se **elimina** antes de subir la nueva.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `204 No Content` | Actualización exitosa |
| `400 Bad Request` | Fallo de validación |
| `403 Forbidden` | No es el propietario |
| `404 Not Found` | Producto no encontrado |
| `409 Conflict` | Producto deshabilitado por admin |

---

#### `PATCH /api/Productos/{id}/estado`

Cambia el estado de un producto usando el patrón State. Al completarse notifica a `CatalogoObserver` y `AuditoriaObserver`.

**Acceso:** `Emprendedor` (propietario) o `Administrador`.  
**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "accion": "ocultar",
  "motivo": "Sin stock por el momento"
}
```

**Valores válidos para `accion`:** `"activar"` · `"ocultar"` · `"eliminar"` (case-insensitive en el servicio).

**Validaciones aplicadas — `CambiarEstadoValidator` (FluentValidation):**

| Campo | Regla | Error retornado |
|---|---|---|
| `accion` | Obligatorio | `"La acción es obligatoria."` |
| `accion` | Debe ser `"activar"`, `"ocultar"` o `"eliminar"` | `"Acción inválida. Use: 'activar', 'ocultar' o 'eliminar'."` |
| `motivo` | Obligatorio si `accion` es `"ocultar"` o `"eliminar"` | `"El motivo es obligatorio al ocultar o eliminar."` |
| `motivo` | Máximo 300 caracteres | `"El motivo no puede superar 300 caracteres."` |

**Comportamiento según rol:**

| Acción | Efecto en Emprendedor | Efecto en Administrador |
|---|---|---|
| `"activar"` | `Estado = Activo` | `Estado = Activo`, `AdminDisabled = false` |
| `"ocultar"` | `Estado = Inactivo` | `Estado = Inactivo`, `AdminDisabled = true` |
| `"eliminar"` | `Estado = Eliminado` | `Estado = Eliminado` con motivo `"Eliminado por administrador"` |

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `204 No Content` | Cambio de estado exitoso. Auditoría registrada automáticamente |
| `400 Bad Request` | Acción inválida o motivo faltante |
| `403 Forbidden` | Sin permisos suficientes |
| `404 Not Found` | Producto no encontrado |

---

#### `DELETE /api/Productos/{id}`

**Eliminación lógica** del producto. Internamente llama a `CambiarEstadoAsync` con `accion = "eliminar"`. El registro **nunca se borra** de la base de datos.

**Acceso:** `Emprendedor` (propietario) o `Administrador`.

**Motivo automático:**

- Si es Administrador: `"Eliminado por administrador"`.
- Si es Emprendedor: `"Eliminado por emprendedor"`.

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `204 No Content` | Producto marcado como `Eliminado`. Auditoría registrada |
| `403 Forbidden` | Sin permisos |
| `404 Not Found` | Producto no encontrado |

---

### 👤 Módulo de Perfiles — `/api/Perfiles`

---

#### `GET /api/Perfiles/{id}`

Obtiene el perfil del usuario indicado. **Solo el propio usuario puede consultarlo.** El sistema compara el `id` del path con el `sub` del JWT.

**Acceso:** Autenticado (cualquier rol).

**Respuesta según rol del usuario consultado:**

| Tipo | Response DTO | Campos retornados |
|---|---|---|
| Emprendedor | `PerfilEmprendedorResponse` | id, nombre, email, nombreEmprendimiento, descripcion, fotoUrl, rol |
| Comprador | `PerfilCompradorResponse` | id, nombre, email, apodo, sobreTi, fotoUrl, rol |
| Administrador | `PerfilAdminResponse` | id, nombre, email, descripcion, fotoUrl, rol |

**Respuestas de error:**

| Código | Cuándo ocurre |
|---|---|
| `403 Forbidden` | `id` del path ≠ `sub` del JWT |
| `404 Not Found` | Usuario no encontrado |

---

#### `GET /api/Perfiles/publico/{id}`

Obtiene el perfil de **cualquier usuario** sin restricción de ownership.

**Acceso:** Autenticado (cualquier rol).  
**Respuesta:** mismo esquema que `GET /api/Perfiles/{id}` según el rol del usuario consultado.

---

#### `PUT /api/Perfiles/{id}/emprendedor`

Actualiza el perfil de un Emprendedor. Si se envía foto nueva, la anterior se elimina de Supabase. Tras actualizar, propaga `NombreEmprendimiento`, `Descripcion` y `FotoUrl` a todos los productos **no eliminados** del emprendedor.

**Acceso:** Solo `Emprendedor`. El `id` debe coincidir con el `sub` del JWT.  
**Content-Type:** `multipart/form-data`

**Campos del formulario:**

| Campo | Tipo | Requerido |
|---|---|---|
| `nombreEmprendimiento` | string | ✅ |
| `descripcion` | string | ✅ |
| `foto` | IFormFile | ❌ opcional |

**Validaciones aplicadas — `ActualizarPerfilEmprendedorValidator`:**

| Campo | Regla | Error retornado |
|---|---|---|
| `nombreEmprendimiento` | Obligatorio | `"El nombre del emprendimiento es obligatorio."` |
| `nombreEmprendimiento` | Máximo 100 caracteres | `"El nombre no puede superar 100 caracteres."` |
| `descripcion` | Obligatorio | `"La descripción es obligatoria."` |
| `descripcion` | Máximo 500 caracteres | `"La descripción no puede superar 500 caracteres."` |
| `foto.Length` | ≤ 3 MB (si se adjunta) | `"La foto no puede superar 3 MB."` |
| `foto.ContentType` | `image/jpeg`, `image/png` o `image/webp` (si se adjunta) | `"Solo se permiten imágenes JPEG, PNG o WebP."` |

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `204 No Content` | Perfil actualizado y datos propagados a productos |
| `400 Bad Request` | Fallo de validación |
| `403 Forbidden` | Intento de editar perfil ajeno o tipo incorrecto |
| `404 Not Found` | Usuario no encontrado |

---

#### `PUT /api/Perfiles/{id}/comprador`

Actualiza el perfil de un Comprador. Todos los campos son opcionales excepto los que tienen restricciones de longitud.

**Acceso:** Solo `Comprador`. El `id` debe coincidir con el `sub` del JWT.  
**Content-Type:** `multipart/form-data`

**Campos del formulario:**

| Campo | Tipo | Requerido |
|---|---|---|
| `apodo` | string? | ❌ |
| `sobreTi` | string? | ❌ |
| `foto` | IFormFile | ❌ |

**Validaciones aplicadas — `ActualizarPerfilCompradorValidator`:**

| Campo | Regla | Error retornado |
|---|---|---|
| `apodo` | Máximo 50 caracteres (solo si no es `null`) | `"El apodo no puede superar 50 caracteres."` |
| `sobreTi` | Máximo 300 caracteres (solo si no es `null`) | `"La descripción no puede superar 300 caracteres."` |
| `foto.Length` | ≤ 3 MB (si se adjunta) | `"La foto no puede superar 3 MB."` |
| `foto.ContentType` | `image/jpeg`, `image/png` o `image/webp` (si se adjunta) | `"Solo se permiten imágenes JPEG, PNG o WebP."` |

**Respuestas:** `204 No Content` / `400 Bad Request` / `403 Forbidden` / `404 Not Found`

---

#### `PUT /api/Perfiles/{id}/admin`

Actualiza el perfil de un Administrador.

**Acceso:** Solo `Administrador`. El `id` debe coincidir con el `sub` del JWT.  
**Content-Type:** `multipart/form-data`

**Campos del formulario:**

| Campo | Tipo | Requerido |
|---|---|---|
| `descripcion` | string? | ❌ |
| `foto` | IFormFile | ❌ |

**Validaciones aplicadas — `ActualizarPerfilAdminValidator`:**

| Campo | Regla | Error retornado |
|---|---|---|
| `descripcion` | Máximo 300 caracteres (solo si no es `null`) | `"La descripción no puede superar 300 caracteres."` |
| `foto.Length` | ≤ 3 MB (si se adjunta) | `"La foto no puede superar 3 MB."` |
| `foto.ContentType` | `image/jpeg`, `image/png` o `image/webp` (si se adjunta) | `"Solo se permiten imágenes JPEG, PNG o WebP."` |

**Respuestas:** `204 No Content` / `400 Bad Request` / `403 Forbidden` / `404 Not Found`

---

### 🕐 Módulo de Horarios — `/api/Horarios`

---

#### `GET /api/Horarios?emprendedorId={guid}`

Lista los horarios de un emprendedor ordenados por día de semana.

**Acceso:** Autenticado (cualquier rol).  
**Query param:** `emprendedorId` (Guid, requerido)

**Validación de controlador:** si `emprendedorId` es `Guid.Empty` → `400 Bad Request` con `{ "message": "Se requiere el emprendedorId." }`.

**Respuesta exitosa `200 OK`:**

```json
[
  {
    "id": "...",
    "dia": 0,
    "diaNombre": "Lunes",
    "horaApertura": "08:00",
    "horaCierre": "17:00",
    "sede": "Bloque 20",
    "emprendedorId": "..."
  }
]
```

---

#### `POST /api/Horarios`

Crea un horario de atención. El `EmprendedorId` se toma del `sub` del JWT.

**Acceso:** Solo `Emprendedor`.  
**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "dia": 0,
  "horaApertura": "08:00",
  "horaCierre": "17:00",
  "sede": "Bloque 20 — Planta baja"
}
```

**Valores válidos para `dia`:** `0` = Lunes · `1` = Martes · `2` = Miércoles · `3` = Jueves · `4` = Viernes · `5` = Sábado · `6` = Domingo

**Validaciones aplicadas — `CrearHorarioValidator`:**

| Campo | Regla | Error retornado |
|---|---|---|
| `dia` | Entre 0 y 6 inclusive | `"El día debe ser entre 0 (Lunes) y 6 (Domingo)."` |
| `horaApertura` | Obligatorio | `"La hora de apertura es obligatoria."` |
| `horaApertura` | Formato `HH:mm` (regex `^([0-1]\d|2[0-3]):[0-5]\d$`) | `"Formato inválido. Use HH:mm (ej: 08:00)."` |
| `horaCierre` | Obligatorio | `"La hora de cierre es obligatoria."` |
| `horaCierre` | Formato `HH:mm` | `"Formato inválido. Use HH:mm (ej: 17:00)."` |
| `horaCierre > horaApertura` | Comparación de strings (ambos deben ser válidos) | `"La hora de cierre debe ser posterior a la de apertura."` |
| `sede` | Obligatorio | `"La sede es obligatoria."` |
| `sede` | Máximo 100 caracteres | `"La sede no puede superar 100 caracteres."` |

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `201 Created` | Horario creado. Header `Location` apunta a `GET /api/Horarios?emprendedorId={id}` |
| `400 Bad Request` | Fallo de validación |
| `403 Forbidden` | Rol distinto de Emprendedor |

---

#### `PUT /api/Horarios/{id}`

Actualiza un horario existente. Solo puede hacerlo el emprendedor propietario.

**Acceso:** Solo `Emprendedor`.  
**Content-Type:** `application/json`

**Body:** idéntico al de `POST /api/Horarios`.

**Validaciones — `ActualizarHorarioValidator`:** idénticas a `CrearHorarioValidator` (mismos campos, mismas reglas, mismos mensajes con ligeras variaciones en el texto de formato).

**Validaciones de negocio en `HorarioService.ActualizarAsync`:**

| Condición | Código HTTP | Mensaje |
|---|---|---|
| Horario no encontrado | `404 Not Found` | `"Horario con Id '{id}' no encontrado."` |
| `horario.EmprendedorId ≠ emprendedorId` del JWT | `403 Forbidden` | `"No tienes permiso para editar este horario."` |

**Respuestas:** `204 No Content` / `400 Bad Request` / `403 Forbidden` / `404 Not Found`

---

#### `DELETE /api/Horarios/{id}`

Elimina **físicamente** un horario. Solo puede hacerlo el emprendedor propietario.

**Acceso:** Solo `Emprendedor`.

**Validaciones de negocio en `HorarioService.EliminarAsync`:**

| Condición | Código HTTP | Mensaje |
|---|---|---|
| Horario no encontrado | `404 Not Found` | `"Horario con Id '{id}' no encontrado."` |
| `horario.EmprendedorId ≠ emprendedorId` del JWT | `403 Forbidden` | `"No tienes permiso para eliminar este horario."` |

**Respuestas:** `204 No Content` / `403 Forbidden` / `404 Not Found`

---

### 📍 Módulo de Ubicaciones — `/api/Ubicaciones`

---

#### `GET /api/Ubicaciones?emprendedorId={guid}`

Lista las ubicaciones registradas de un emprendedor.

**Acceso:** Autenticado (cualquier rol).  
**Query param:** `emprendedorId` (Guid, requerido)

**Validación de controlador:** si `emprendedorId` es `Guid.Empty` → `400 Bad Request` con `{ "message": "Se requiere el emprendedorId." }`.

**Respuesta exitosa `200 OK`:**

```json
[
  {
    "id": "...",
    "nombreSede": "Cafetería Bloque 20",
    "descripcion": "Planta baja, junto a la fotocopiadora",
    "referenciaMapa": "https://maps.google.com/...",
    "emprendedorId": "..."
  }
]
```

---

#### `POST /api/Ubicaciones`

Crea una ubicación para el emprendedor autenticado.

**Acceso:** Solo `Emprendedor`.  
**Content-Type:** `application/json`

**Body de ejemplo:**

```json
{
  "nombreSede": "Cafetería Bloque 20",
  "descripcion": "Planta baja, junto a la fotocopiadora",
  "referenciaMapa": "https://goo.gl/maps/ejemplo"
}
```

**Validaciones aplicadas — `CrearUbicacionValidator`:**

| Campo | Regla | Error retornado |
|---|---|---|
| `nombreSede` | Obligatorio | `"El nombre de la sede es obligatorio."` |
| `nombreSede` | Máximo 100 caracteres | `"El nombre no puede superar 100 caracteres."` |
| `descripcion` | Obligatorio | `"La descripción es obligatoria."` |
| `descripcion` | Máximo 300 caracteres | `"La descripción no puede superar 300 caracteres."` |
| `referenciaMapa` | Máximo 500 caracteres (solo si no es `null`) | `"La referencia no puede superar 500 caracteres."` |

**Respuestas:**

| Código | Cuándo ocurre |
|---|---|
| `201 Created` | Ubicación creada |
| `400 Bad Request` | Fallo de validación |
| `403 Forbidden` | Rol distinto de Emprendedor |

---

#### `PUT /api/Ubicaciones/{id}`

Actualiza una ubicación existente. Solo puede hacerlo el emprendedor propietario.

**Acceso:** Solo `Emprendedor`.  
**Content-Type:** `application/json`

**Body:** idéntico al de `POST /api/Ubicaciones`.

**Validaciones — `ActualizarUbicacionValidator`:** idénticas a `CrearUbicacionValidator`.

**Validaciones de negocio en `UbicacionService.ActualizarAsync`:**

| Condición | Código HTTP | Mensaje |
|---|---|---|
| Ubicación no encontrada | `404 Not Found` | `"Ubicación con Id '{id}' no encontrada."` |
| `ubicacion.EmprendedorId ≠ emprendedorId` del JWT | `403 Forbidden` | `"No tienes permiso para editar esta ubicación."` |

**Respuestas:** `204 No Content` / `400 Bad Request` / `403 Forbidden` / `404 Not Found`

---

#### `DELETE /api/Ubicaciones/{id}`

Elimina **físicamente** una ubicación. Solo puede hacerlo el emprendedor propietario.

**Acceso:** Solo `Emprendedor`.

**Validaciones de negocio en `UbicacionService.EliminarAsync`:**

| Condición | Código HTTP | Mensaje |
|---|---|---|
| Ubicación no encontrada | `404 Not Found` | `"Ubicación con Id '{id}' no encontrada."` |
| `ubicacion.EmprendedorId ≠ emprendedorId` del JWT | `403 Forbidden` | `"No tienes permiso para eliminar esta ubicación."` |

**Respuestas:** `204 No Content` / `403 Forbidden` / `404 Not Found`

---

## ⚠️ Manejo Global de Errores

El `ErrorHandlingMiddleware` intercepta **todas** las excepciones no controladas del pipeline y las transforma en respuestas JSON estructuradas:

| Excepción capturada | Código HTTP | Formato de respuesta |
|---|---|---|
| `KeyNotFoundException` | `404 Not Found` | `{ "message": "Mensaje de la excepción" }` |
| `InvalidOperationException` | `409 Conflict` | `{ "message": "Mensaje de la excepción" }` |
| `UnauthorizedAccessException` | `403 Forbidden` | `{ "message": "Mensaje de la excepción" }` |
| `ArgumentException` | `400 Bad Request` | `{ "message": "Mensaje de la excepción" }` |
| Cualquier otra `Exception` | `500 Internal Server Error` | `{ "message": "Error interno del servidor." }` |

> Los controladores no usan bloques `try/catch`. Todo el manejo de errores está centralizado en el middleware.

---

---

## 🔍 Consideraciones Técnicas

**Clean Architecture estricta.** El dominio no depende de EF Core, ASP.NET ni Supabase. Cambiar cualquier tecnología de infraestructura no requiere tocar la lógica de negocio.

**DTOs en la capa Application.** Todos los objetos `*Request` y `*Response` viven en `Application/DTOs/`. La API solo contiene controllers, middleware y mappings. Esto evita que la capa de presentación quede acoplada al modelo de dominio.

**Separación lectura/escritura en productos.** `ProductoService` gestiona escrituras (actualizar, cambiar estado) y `ProductoQueryService` las lecturas (catálogo, admin, mis-productos, estadísticas). Esto aplica SRP y facilita la optimización independiente de cada flujo.

**Guid como PK.** No expone el conteo real de registros. Permite generar IDs antes de persistir. Más seguro frente a enumeración de recursos por URL.

**AdminDisabled como flag independiente.** Permite distinguir entre un producto desactivado voluntariamente por el emprendedor y uno desactivado por el administrador. Cuando `AdminDisabled = true`, el emprendedor no puede editarlo aunque sea el propietario.

**Soft delete.** `EstadoProducto.Eliminado` nunca borra físicamente la fila. Preserva el histórico para auditoría y trazabilidad.

**JWT sin consulta a BD por request.** Los claims `sub`, `role` y `email` se incluyen en el token. Los controllers los extraen con `User.FindFirstValue(ClaimTypes.NameIdentifier)` sin round-trip adicional.

**Orden del middleware es crítico:**
```
ErrorHandlingMiddleware  →  CORS  →  HTTPS Redirect  →  Authentication  →  Authorization  →  Controllers
```
Un orden incorrecto produce comportamientos silenciosos difíciles de depurar.

---

## 🔮 Mejoras Futuras

- **Suite de pruebas:** Completar tests unitarios en `ITM.Emprendimientos.Domain.Tests` e implementar tests de integración con `WebApplicationFactory<Program>`.
- **Refresh tokens:** Renovación del JWT sin requerir nuevo login.
- **Paginación:** En catálogo, administración y mis-productos para soportar volúmenes grandes de datos.
- **Rate limiting:** Proteger los endpoints de autenticación contra ataques de fuerza bruta.
- **Containerización:** Agregar `Dockerfile` y `docker-compose.yml` para despliegue reproducible.
- **CI/CD:** Pipeline con GitHub Actions para build, tests y despliegue automático.
- **Favoritos:** Permitir a compradores guardar productos y emprendedores de interés.
- **Mensajería:** Canal de comunicación directa comprador → emprendedor.
- **Notificaciones en tiempo real:** SignalR para alertas de cambio de estado de productos.
- **Panel de reportes:** Métricas de actividad por emprendedor para el administrador.
- **Módulo de reseñas:** Calificación de productos por parte de los compradores.

---

<p align="center">
  <sub>Plataforma Digital para Emprendimientos del ITM &nbsp;·&nbsp; API v1.0 &nbsp;·&nbsp; Mayo 2026</sub>
</p>