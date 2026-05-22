# 🍳 CeroSobras — Recetas Inteligentes con IA

> **Trabajo de Fin de Grado (TFG)**
>
> Aplicación móvil para generar recetas de cocina personalizadas utilizando **Inteligencia Artificial (Google Gemini)**, basándose en los ingredientes que el usuario tiene en su inventario. El objetivo es **reducir el desperdicio de alimentos** permitiendo al usuario cocinar solo con lo que ya tiene en casa.

---
## ⚡ Comandos Rápidos
 
### Instalación
 
```bash
pnpm install                        # Instala todas las dependencias del monorepo
```
 
### Desarrollo
 
```bash
pnpm dev                            # Arranca backend + frontend en paralelo (Turborepo)
```
 
```bash
# O por separado:
cd apps/backend && pnpm start:dev           # Backend en modo watch (puerto 3000)
cd apps/frontend/app-front && npx expo start   # Frontend Expo (escaner QR / emulador)
```
 
### Base de datos
 
```bash
cd apps/backend
npx prisma migrate deploy           # Aplica todas las migraciones pendientes
npx prisma migrate dev              # Crea y aplica una nueva migración (desarrollo)
npx prisma generate                 # Regenera el cliente de Prisma tras cambios en schema
npx prisma studio                   # Abre el explorador visual de la DB en el navegador
```
 
### Build producción
 
```bash
pnpm build                          # Build completo del monorepo (Turborepo)
```
 
```bash
# O por separado:
cd apps/backend && pnpm build       # Compila NestJS a /dist
cd apps/backend && pnpm start:prod  # Arranca el backend compilado
```
 
```bash
# Frontend — build nativo con EAS:
cd apps/frontend/app-front
npx eas build --platform android    # Build APK/AAB para Android
npx eas build --platform ios        # Build IPA para iOS
npx eas build --platform all        # Build para ambas plataformas
```
 
### Utilidades
 
```bash
pnpm lint                           # Linting en todo el monorepo
pnpm --filter backend test          # Tests del backend
pnpm --filter backend test:e2e      # Tests end-to-end del backend
```
 
---
---

## 📋 Índice

1. [Descripción General](#-descripción-general)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
4. [Estructura de Carpetas](#-estructura-de-carpetas)
5. [Flujo de Datos Completo](#-flujo-de-datos-completo)
6. [Backend — Capa por Capa](#-backend--capa-por-capa)
   - [Capa de Presentación (Controllers)](#1-capa-de-presentación-controllers)
   - [Capa de Dominio (Entities, DTOs, Use Cases, Interfaces)](#2-capa-de-dominio-entities-dtos-use-cases-interfaces)
   - [Capa de Datos (Repositories, Prisma, AI Service)](#3-capa-de-datos-repositories-prisma-ai-service)
   - [Módulos Transversales (Auth, Mail, Common)](#4-módulos-transversales-auth-mail-common)
7. [Frontend — Capa por Capa](#-frontend--capa-por-capa)
   - [Pantallas (Vistas)](#1-pantallas-vistas)
   - [ViewModels (MVVM)](#2-viewmodels-mvvm)
   - [Capa de Dominio (Entities, DTOs, Use Cases, Interfaces)](#3-capa-de-dominio-frontend)
   - [Capa de Datos (Repositories, API Client)](#4-capa-de-datos-frontend)
   - [Inversión de Dependencias (Inversify)](#5-inversión-de-dependencias-inversify)
8. [API REST — Endpoints](#-api-rest--endpoints)
9. [Base de Datos — Esquema Completo](#-base-de-datos--esquema-completo)
   - [Diagrama Entidad-Relación](#diagrama-entidad-relación)
   - [Script SQL Completo](#script-sql-completo)
10. [Autenticación y Seguridad](#-autenticación-y-seguridad)
11. [Servicio de IA (Google Gemini)](#-servicio-de-ia-google-gemini)
12. [Variables de Entorno](#-variables-de-entorno)
13. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)

---
## WEB
  URL: https://tfg-recipes-frontend-dqq47lpjh-robmor92x-2625s-projects.vercel.app/
## Usuarios
  SUPERUSER:
    Usuario: admin@admin.com
    Contraseña: admin
  USER:
    Usuario: user@user.com
    Contraseña: user123

## 🌟 Descripción General

**CeroSobras** es una aplicación fullstack compuesta por:

| Componente | Tecnología | Descripción |
|---|---|---|
| **Frontend** | React Native + Expo | App móvil (iOS/Android) con navegación por Stack |
| **Backend** | NestJS (Node.js) | API REST con Clean Architecture |
| **Base de datos** | PostgreSQL + Prisma ORM | Almacenamiento persistente |
| **IA** | Google Gemini API | Generación automática de recetas |
| **Email** | Resend / SMTP (Nodemailer) | Verificación de cuenta y recuperación de contraseña |

### Características principales

- 🤖 **Generación de recetas con IA** — El usuario selecciona ingredientes de su inventario y la IA genera una receta completa (nombre, ingredientes, pasos con temporizadores).
- 📦 **Inventario personal** — Cada usuario tiene un inventario 1:1 donde gestiona los alimentos que tiene en casa.
- 🔐 **Autenticación JWT** — Sistema completo con access tokens (15min) + refresh tokens (7 días), verificación de email y recuperación de contraseña.
- 🛡️ **Roles** — Sistema de roles `USER` / `SUPERUSER` con límite diario de recetas configurable para usuarios normales.
- 📧 **Notificaciones por email** — Código de verificación de cuenta y recuperación de contraseña vía Resend o SMTP.
- 📖 **Swagger/OpenAPI** — Documentación interactiva de la API en `/api/docs`.

---

## 🛠 Stack Tecnológico

### Monorepo

| Herramienta | Función |
|---|---|
| **pnpm** | Gestor de paquetes (workspaces) |
| **Turborepo** | Orquestador de tareas (build, dev, lint) |

### Backend (`apps/backend`)

| Tecnología | Versión | Función |
|---|---|---|
| **NestJS** | 11.x | Framework Node.js con inyección de dependencias |
| **Prisma** | 7.x | ORM para PostgreSQL |
| **PostgreSQL** | — | Base de datos relacional |
| **Passport + JWT** | — | Autenticación basada en tokens |
| **bcrypt** | 6.x | Hash de contraseñas |
| **@google/genai** | 1.x | SDK oficial de Google Gemini |
| **Nodemailer** | 8.x | Envío de emails (SMTP) |
| **Swagger** | 11.x | Documentación automática de la API |
| **class-validator** | 0.15 | Validación de DTOs con decoradores |

### Frontend (`apps/frontend/app-front`)

| Tecnología | Versión | Función |
|---|---|---|
| **React Native** | 0.81 | Framework UI multiplataforma |
| **Expo** | 54.x | Plataforma de desarrollo móvil |
| **Expo Router** | 6.x | Navegación file-based (Stack) |
| **Inversify** | 7.x | Contenedor de Inversión de Dependencias |
| **React Native Reanimated** | 4.x | Animaciones fluidas |
| **Expo Secure Store** | — | Almacenamiento seguro de tokens |
| **Expo Haptics** | — | Feedback háptico |
| **Inter Font** | — | Tipografía personalizada (Google Fonts) |

---

## 🏗 Arquitectura del Proyecto

El proyecto sigue **Clean Architecture** tanto en el backend como en el frontend, con una separación estricta en capas concéntricas:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION                         │
│  (Controllers / Screens / ViewModels)                   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │                     DOMAIN                        │  │
│  │  (Entities, Use Cases, Interfaces, DTOs)          │  │
│  │                                                   │  │
│  │  ┌─────────────────────────────────────────────┐  │  │
│  │  │                   DATA                      │  │  │
│  │  │  (Repositories, DB, API Client, AI)         │  │  │
│  │  └─────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Regla de Dependencias

> Las capas internas **nunca** conocen a las capas externas. La capa de **Dominio** define interfaces que la capa de **Data** implementa. La capa de **Presentación** consume los Use Cases del dominio.

### Patrón adicional en el Frontend: **MVVM**

El frontend añade el patrón **Model-View-ViewModel**:

```
Vista (Screen) ──usa──▶ ViewModel (hook) ──usa──▶ UseCase ──usa──▶ Repository ──HTTP──▶ Backend API
```

---

## 📁 Estructura de Carpetas

```
TFG/                              ← Raíz del monorepo
├── apps/
│   ├── backend/                   ← API REST NestJS
│   │   ├── prisma/
│   │   │   ├── schema.prisma      ← Esquema de la base de datos
│   │   │   └── migrations/        ← Migraciones SQL
│   │   └── src/
│   │       ├── main.ts            ← Punto de entrada (bootstrap)
│   │       ├── app.module.ts      ← Módulo raíz de NestJS
│   │       │
│   │       ├── presentation/      ← CAPA PRESENTACIÓN
│   │       │   ├── users/         ← UsersController + módulo
│   │       │   ├── recipe/        ← RecipeController + módulo
│   │       │   ├── inventory/     ← InventoryController + módulo
│   │       │   └── item/          ← ItemController + módulo
│   │       │
│   │       ├── domain/            ← CAPA DOMINIO
│   │       │   ├── user/          ← Entity, DTOs, Interfaces, UseCases
│   │       │   ├── recipe/        ← Entity, DTOs, Interfaces, UseCases
│   │       │   ├── inventory/     ← Entity, DTOs, Interfaces, UseCases
│   │       │   ├── item/          ← Entity, DTOs, Interfaces, UseCases
│   │       │   └── auth/          ← RefreshToken entity + interface
│   │       │
│   │       ├── data/              ← CAPA DATOS
│   │       │   ├── repository/    ← Implementaciones de repos (Prisma)
│   │       │   └── AI/            ← (reservado)
│   │       │
│   │       ├── ai/                ← Servicio de Google Gemini
│   │       ├── auth/              ← Autenticación (JWT, Guards, DTOs)
│   │       ├── mail/              ← Servicio de correo electrónico
│   │       ├── prisma/            ← PrismaService (conexión DB)
│   │       └── common/            ← Interceptors, Filters, DTOs globales
│   │
│   └── frontend/
│       └── app-front/             ← App móvil Expo/React Native
│           └── src/
│               ├── app/           ← VISTAS (Screens) + Navegación
│               │   ├── _layout.tsx      ← Layout raíz (Stack Navigator)
│               │   ├── index.tsx        ← Pantalla inicial (redirect)
│               │   └── vistas/          ← Todas las pantallas
│               │
│               ├── presentation/  ← CAPA PRESENTACIÓN
│               │   ├── viewmodel/ ← ViewModels (hooks de React)
│               │   ├── context/   ← AuthContext (estado global)
│               │   └── theme/     ← Sistema de diseño (colores, fuentes, componentes)
│               │
│               ├── domain/        ← CAPA DOMINIO
│               │   ├── entities/  ← User, Recipe, Item, Inventory
│               │   ├── dto/       ← DTOs de request
│               │   ├── interfaces/← Contratos de Use Cases
│               │   ├── repositories/← Contratos de Repositories
│               │   └── usecases/  ← Implementaciones de Use Cases
│               │
│               ├── data/          ← CAPA DATOS
│               │   ├── repositories/← Implementaciones HTTP de repos
│               │   ├── network/   ← ApiClient (fetch + refresh token)
│               │   └── database/  ← connection.ts (config URL)
│               │
│               └── core/          ← INFRAESTRUCTURA
│                   ├── container.ts         ← Contenedor Inversify (DI)
│                   ├── TYPES.ts             ← Símbolos únicos para DI
│                   └── token-storage.service.ts ← Gestión de tokens (SecureStore)
│
├── packages/
│   └── shared/                    ← Paquete compartido (futuro)
│
├── package.json                   ← Scripts del monorepo
├── pnpm-workspace.yaml            ← Configuración de workspaces
└── turbo.json                     ← Pipeline de Turborepo
```

---

## 🔄 Flujo de Datos Completo

### Flujo 1: Generar una Receta con IA

Este es el flujo principal de la aplicación. Sigue estos pasos:

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌────────────┐     ┌──────────┐
│   PANTALLA  │     │  ViewModel  │     │   UseCase    │     │  Repository   │     │ API Client │     │ BACKEND  │
│ CrearReceta │────▶│  RecipeVM   │────▶│ RecipeUseCase│────▶│RecipeRepo(HTTP)────▶│  apiClient │────▶│ API REST │
│  Screen.tsx │     │  (hook)     │     │  (front)     │     │              │     │            │     │          │
└─────────────┘     └─────────────┘     └──────────────┘     └───────────────┘     └────────────┘     └──────────┘
                                                                                                           │
                                                                                                           ▼
                                                                                                    ┌──────────────┐
                                                                                                    │   Controller │
                                                                                                    │ RecipeCtrl   │
                                                                                                    └──────┬───────┘
                                                                                                           │
                                                                                                           ▼
                                                                                                    ┌──────────────┐
                                                                                                    │   UseCase    │
                                                                                                    │ RecipeUseCase│
                                                                                                    │  (back)      │
                                                                                                    └──────┬───────┘
                                                                                                     │            │
                                                                                                     ▼            ▼
                                                                                              ┌───────────┐ ┌──────────┐
                                                                                              │ AiService │ │ RecipeRepo│
                                                                                              │ (Gemini)  │ │ (Prisma) │
                                                                                              └─────┬─────┘ └────┬─────┘
                                                                                                    │            │
                                                                                                    ▼            ▼
                                                                                              ┌───────────┐ ┌──────────┐
                                                                                              │Google     │ │PostgreSQL│
                                                                                              │Gemini API │ │   DB     │
                                                                                              └───────────┘ └──────────┘
```

**Paso a paso detallado:**

1. **Pantalla `CrearRecetaScreen`** — El usuario selecciona tipo de receta (Desayuno/Comida/Cena), número de personas, preferencias dietéticas e ingredientes de su inventario.
2. **`useRecipeVM()` (ViewModel)** — El hook `addRecipe()` construye el `RecipeCreateRequestDTO` con el prompt para la IA y lo envía al UseCase.
3. **`RecipeUseCase` (frontend)** — Llama a `RecipeRepository.post(dto)` vía la interfaz `IRecipeRepository`.
4. **`RecipeRepository` (frontend, HTTP)** — Hace `POST /api/recipes/add` al backend usando `apiClient`.
5. **`ApiClient`** — Añade el Bearer Token JWT automáticamente. Si recibe un 401, intenta refrescar el token automáticamente.
6. **`RecipeController` (backend)** — Recibe el request, extrae el `user_uuid` del token JWT con `@CurrentUser()`, y delega al `RecipeUseCase`.
7. **`RecipeUseCase` (backend)** — Verifica que el usuario existe, comprueba el **límite diario de recetas** (SUPERUSER ilimitado), y llama a `AiService.generate(prompt)`.
8. **`AiService`** — Envía el prompt a **Google Gemini** con un schema JSON estricto, parsea y valida la respuesta (name, ingredients, steps con timerMinutes).
9. **`RecipeRepository` (backend, Prisma)** — Persiste la receta generada en PostgreSQL.
10. **Respuesta** — La receta creada se devuelve al frontend, que navega automáticamente a `RecetaDetalleScreen`.

---

### Flujo 2: Registro de un nuevo usuario

```
RegisterScreen ──▶ UserVM.register() ──▶ UserUseCase.post() ──▶ UserRepo.post()
                                                                      │
                                                                      ▼ HTTP POST /api/users/add
                                                               ┌──────────────┐
                                                               │UsersController│
                                                               └──────┬───────┘
                                                                      │
                                                               ┌──────▼───────┐
                                                               │ UserUseCase  │
                                                               │   (back)     │
                                                               └──────┬───────┘
                                                                 │          │
                                                                 ▼          ▼
                                                          ┌──────────┐  ┌──────────────┐
                                                          │UserRepo  │  │InventoryRepo │
                                                          │.add()    │  │.add()        │
                                                          │(hash pwd)│  │(crea vacío)  │
                                                          └──────────┘  └──────────────┘
```

> Al registrarse, se crea automáticamente un **Inventario vacío** para el usuario (relación 1:1).

---

### Flujo 3: Login y gestión de tokens

```
LoginScreen ──▶ AuthRepo.login(email, pwd)
                        │
                        ▼ HTTP POST /api/auth/login
                 ┌──────────────┐
                 │AuthController │
                 └──────┬───────┘
                        │
                 ┌──────▼───────┐
                 │ AuthService  │
                 └──────┬───────┘
                   │         │         │
                   ▼         ▼         ▼
            ┌──────────┐ ┌────────┐ ┌──────────────────┐
            │UserRepo  │ │bcrypt  │ │RefreshTokenRepo  │
            │.getByEmail│ │.compare│ │.create(hash)     │
            └──────────┘ └────────┘ └──────────────────┘
                                           │
                                           ▼
                                    Devuelve:
                                    - access_token (JWT, 15min)
                                    - refresh_token (opaco, 7 días)
                                    - user_uuid, name, email
```

---

## 📦 Backend — Capa por Capa

### 1. Capa de Presentación (Controllers)

Los Controllers son la **puerta de entrada** a la API. Reciben las peticiones HTTP, validan los DTOs y delegan a los Use Cases del dominio. Están decorados con Swagger para auto-documentación.

| Controller | Ruta base | Métodos |
|---|---|---|
| **`UsersController`** | `api/users` | `GET /` · `GET /profile` · `GET /:user_uuid` · `POST /add` · `DELETE /delete` · `PUT /update` |
| **`RecipeController`** | `api/recipes` | `GET /user/:user_uuid` · `GET /:recipe_uuid` · `POST /add` · `DELETE /delete` |
| **`InventoryController`** | `api/inventory` | `GET /:user_uuid` · `DELETE /delete` |
| **`ItemController`** | `api/items` | `POST /add` · `DELETE /delete` · `PUT /update` |
| **`AuthController`** | `api/auth` | `POST /login` · `POST /refresh` · `POST /logout` · `POST /verify-account` · `POST /forgot-password` · `POST /verify-reset-code` · `POST /reset-password` |

**Protección de rutas:**
- Todos los controllers (excepto Auth) aplican `@UseGuards(JwtAuthGuard)` globalmente.
- Endpoints públicos se marcan con `@Public()` (ej: `POST /users/add`, login, register).
- El decorador `@CurrentUser()` extrae el `user_uuid` del token JWT.

---

### 2. Capa de Dominio (Entities, DTOs, Use Cases, Interfaces)

El **dominio** es el corazón de la aplicación. Define las reglas de negocio independientemente de la tecnología.

#### Entidades (Entities)

| Entidad | Campos | Descripción |
|---|---|---|
| **`User`** | `id`, `user_uuid`, `name`, `email`, `password`, `role` (`USER`/`SUPERUSER`), `isVerified`, `verificationCode`, `verificationCodeExpires`, `resetPasswordCode`, `resetPasswordCodeExpires`, `createdAt`, `updatedAt` | Representa un usuario registrado |
| **`Recipe`** | `recipe_uuid`, `name`, `ingredients[]`, `steps[{instruction, timerMinutes}]`, `type` (`BREAKFAST`/`LUNCH`/`DINNER`), `user_uuid`, `createdAt`, `updatedAt` | Receta generada por IA |
| **`Inventory`** | `id`, `inventory_uuid`, `user_uuid`, `items[]`, `createdAt`, `updatedAt` | Inventario 1:1 con un usuario, contiene Items |
| **`Item`** | `id`, `inventory_id`, `name`, `quantity`, `quantity_unit` (`LITRES`/`KILOGRAMS`/`GRAMS`/`UNITS`), `createdAt`, `updatedAt` | Ingrediente individual en un inventario |
| **`RefreshToken`** | `id`, `token_hash`, `user_uuid`, `expires_at`, `created_at`, `revoked` | Token de refresco (opaco, hasheado con SHA-256) |

#### DTOs (Data Transfer Objects)

Los DTOs validan y transforman los datos de entrada/salida. Usan decoradores de `class-validator`:

| Entidad | DTOs de Request | DTO de Response |
|---|---|---|
| **User** | `UserAddRequestDTO` (name, email, password) · `UserUpdateRequestDTO` (user_uuid, name, email) · `UserDeleteRequestDTO` (user_uuid) · `UserGetByUUIDRequestDTO` (user_uuid) | `UserResponseDTO` (user_uuid, name, email, role, dailyRecipeCount, dailyRecipeLimit, createdAt) |
| **Recipe** | `RecipeAddRequestDTO` (prompt, type, user_uuid) · `RecipeDeleteRequestDTO` (recipe_uuid) · `RecipeGetByUserRequestDTO` (user_uuid) | `RecipeResponseDTO` (recipe_uuid, name, ingredients[], steps[], type, createdAt, dailyRecipeCount, dailyRecipeLimit) |
| **Inventory** | `InventoryGetByUserRequestDTO` (user_uuid) | `InventoryResponseDTO` (inventory_uuid, user_uuid, items[], createdAt) |
| **Item** | `ItemAddRequestDTO` (inventory_uuid, name, quantity, quantity_unit) · `ItemUpdateRequestDTO` (id, name, quantity, quantity_unit) · `ItemDeleteRequestDTO` (id) | `ItemResponseDTO` (id, name, quantity, quantityUnit) |

> **Nota**: Los DTOs de Response **nunca** exponen datos internos sensibles como `password`, `id` numérico o `inventory_id`.

#### Use Cases (Casos de Uso)

Cada Use Case implementa una **interfaz** del dominio y contiene toda la **lógica de negocio**:

| UseCase | Métodos | Lógica de negocio destacada |
|---|---|---|
| **`UserUseCase`** | `getList()`, `getByUUID()`, `add()`, `delete()`, `update()` | Al hacer `add()`: hashea password con bcrypt, crea inventario vacío automáticamente. Controla duplicados de email (P2002). Calcula `dailyRecipeCount/Limit` en el response. |
| **`RecipeUseCase`** | `getByUserUUID()`, `getByUUID()`, `add()`, `delete()` | Al hacer `add()`: verifica usuario existe, **comprueba límite diario** (configurable vía `DAILY_RECIPE_LIMIT`), llama a `AiService.generate(prompt)`, persiste resultado. SUPERUSER sin límite. |
| **`InventoryUseCase`** | `getByUserUUID()`, `getByInternalUserId()`, `add()`, `delete()` | Mapea inventario con items anidados. Se crea automáticamente con cada nuevo usuario. |
| **`ItemUseCase`** | `add()`, `delete()`, `update()` | Al hacer `add()`: si el item ya existe en el inventario (mismo nombre), **suma la cantidad** en vez de crear uno nuevo. Resuelve `inventory_id` a partir de `inventory_uuid`. |

#### Interfaces (Contratos)

Cada dominio define dos interfaces:
- **`IXxxUseCase`** — Contrato entre Controller → UseCase
- **`IXxxRepository`** — Contrato entre UseCase → Repository (implementado en capa Data)

Esto permite **sustituir** la implementación sin cambiar la lógica de negocio (ej: cambiar Prisma por otro ORM).

---

### 3. Capa de Datos (Repositories, Prisma, AI Service)

#### PrismaService

```typescript
@Injectable()
export class PrismaService implements OnModuleInit {
  // Conecta a PostgreSQL usando pg Pool + Prisma Adapter
  // Expone accesores: .user, .recipe, .inventory, .item, .refreshToken
}
```

Se conecta usando `DATABASE_URL` del `.env` y expone las tablas del schema como propiedades.

#### Repositories (Implementaciones)

Cada repository implementa la interfaz del dominio accediendo a la DB vía Prisma:

| Repository | Interfaz | Métodos principales | Detalles |
|---|---|---|---|
| **`UserRepository`** | `IUserRepository` | `getList()`, `getById()`, `getByUUID()`, `getByEmail()`, `add()`, `delete()`, `update()`, `validatePassword()`, `verifyUser()`, `updatePassword()`, `updateResetPasswordCode()`, `clearResetPasswordCode()` | Hashea passwords con bcrypt al crear. `mapToEntity()` convierte el modelo Prisma a la entidad del dominio. |
| **`RecipeRepository`** | `IRecipeRepository` | `getByUUID()`, `getByUserUUID()`, `add()`, `delete()`, `countByUserSince()` | `countByUserSince()` se usa para el límite diario. Steps se guardan como `JSONB`. |
| **`InventoryRepository`** | `IInventoryRepository` | `getByUserUUID()`, `add()`, `delete()` | Incluye items en todas las queries (`include: { items: true }`). |
| **`ItemRepository`** | `IItemRepository` | `getById()`, `findByNameAndInventoryId()`, `add()`, `delete()`, `update()` | `findByNameAndInventoryId()` permite detectar items duplicados para sumar cantidades. |
| **`RefreshTokenRepository`** | `IRefreshTokenRepository` | `create()`, `getByTokenHash()`, `revoke()`, `revokeAllByUser()`, `deleteExpired()` | Los tokens se almacenan como hash SHA-256. `revokeAllByUser()` se usa al cambiar password. |

#### AiService (Google Gemini)

```typescript
@Injectable()
export class AiService {
  // Usa @google/genai SDK
  // Modelo configurable: GEMINI_MODEL (default: gemini-3-flash)
  
  async generate(prompt: string): Promise<{
    name: string;
    ingredients: string[];
    steps: { instruction: string; timerMinutes: number }[];
  }>
}
```

**Proceso de generación:**
1. Envía el prompt al modelo Gemini con `responseMimeType: 'application/json'` y un `responseSchema` estricto.
2. Parsea la respuesta JSON.
3. Valida la estructura (name obligatorio, ingredients no vacío, steps con instruction válida).
4. Devuelve el objeto tipado al UseCase.

---

### 4. Módulos Transversales (Auth, Mail, Common)

#### AuthService

| Método | Función |
|---|---|
| `login()` | Valida email + password, genera access_token (JWT) y refresh_token (opaco + hash SHA-256) |
| `refreshToken()` | Valida refresh token, revoca el anterior, genera nuevos tokens (rotación) |
| `logout()` | Revoca refresh token específico o todos los del usuario |
| `verifyAccount()` | Verifica código de 6 dígitos enviado por email |
| `requestPasswordReset()` | Genera código, lo guarda en la DB con expiración (1h), envía email |
| `verifyResetCode()` | Valida el código de reset |
| `resetPassword()` | Cambia password (hash bcrypt), limpia código, revoca todos los refresh tokens |

#### JwtAuthGuard + JwtStrategy

- **`JwtStrategy`** — Extrae token del header `Authorization: Bearer <token>`, valida contra `JWT_SECRET`, devuelve `{ user_uuid, email, role }`.
- **`JwtAuthGuard`** — Se aplica globalmente. Si el endpoint tiene `@Public()`, permite acceso sin token.

#### MailService

Soporta dos backends de envío:
1. **Resend API** (prioritario si `RESEND_API_KEY` está configurado)
2. **SMTP** (Nodemailer, como fallback)
3. **Consola** (si no hay configuración, loguea el email en consola)

Métodos:
- `sendVerificationCode(email, code)` — Código de verificación de cuenta (expira en 24h)
- `sendPasswordResetCode(email, code)` — Código de recuperación de contraseña (expira en 1h)

#### Common (TransformInterceptor + HttpExceptionFilter)

**TransformInterceptor** — Envuelve **todas** las respuestas exitosas en un formato estándar:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

**HttpExceptionFilter** — Captura **todas** las excepciones y devuelve un formato consistente:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descripción del error",
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

---

## 📱 Frontend — Capa por Capa

### 1. Pantallas (Vistas)

| Pantalla | Ruta | Función |
|---|---|---|
| `index.tsx` | `/` | Redirect inicial (comprueba sesión) |
| `LoginScreen.tsx` | `/vistas/LoginScreen` | Formulario de login |
| `RegisterScreen.tsx` | `/vistas/RegisterScreen` | Formulario de registro |
| `ForgotPasswordScreen.tsx` | `/vistas/ForgotPasswordScreen` | Solicitar código de reset |
| `VerifyResetCodeScreen.tsx` | `/vistas/VerifyResetCodeScreen` | Verificar código de reset |
| `ResetPasswordScreen.tsx` | `/vistas/ResetPasswordScreen` | Cambiar contraseña |
| `HomeScreen.tsx` | `/vistas/HomeScreen` | Pantalla principal (dashboard) |
| `RecetasScreen.tsx` | `/vistas/RecetasScreen` | Listado de recetas del usuario |
| `RecetaDetalleScreen.tsx` | `/vistas/RecetaDetalleScreen` | Detalle completo de una receta |
| `CrearRecetaScreen.tsx` | `/vistas/CrearRecetaScreen` | Formulario para generar receta con IA |
| `InventarioScreen.tsx` | `/vistas/InventarioScreen` | Gestión del inventario de ingredientes |

**Navegación**: Se usa **Expo Router** con `Stack Navigator` y animación `slide_from_right`. El `_layout.tsx` raíz envuelve todo en `SafeAreaProvider` → `AuthProvider` → `Stack`.

---

### 2. ViewModels (MVVM)

Cada ViewModel es un **hook de React** que encapsula el estado y la lógica de interacción:

| ViewModel | Estado | Acciones | Lógica destacada |
|---|---|---|---|
| **`useRecipeVM()`** | `recipes[]`, `isLoading` | `loadRecipes()`, `addRecipe()`, `deleteRecipe()` | Al crear/borrar receta, actualiza `dailyRecipeCount` en el `AuthContext` |
| **`useUserVM()`** | `user`, `isLoading` | `loadUser()`, `registerUser()` | — |
| **`useInventoryVM()`** | `inventory`, `isLoading` | `loadInventory()` | Carga inventario con items anidados |
| **`useItemVM()`** | `isLoading` | `addItem()`, `editItem()`, `removeItem()` | — |

---

### 3. Capa de Dominio (Frontend)

Misma estructura que el backend, pero adaptada al consumo desde la app móvil:

- **Entities**: `User`, `Recipe` (con `RecipeStep`), `Item`, `Inventory` — Interfaces TypeScript simples
- **DTOs**: `RecipeCreateRequestDTO`, `UserCreateRequestDTO` — Objetos para las peticiones
- **Interfaces**: `IRecipeUseCase`, `IUserUseCase`, `IItemUseCase`, `IInventoryUseCase`, `IAuthRepository` — Contratos
- **Use Cases**: Implementaciones que llaman a los Repositories

---

### 4. Capa de Datos (Frontend)

#### ApiClient (`data/network/api-client.ts`)

Cliente HTTP centralizado con:
- **Auto-inyección de Bearer Token** en cada request
- **Refresh automático de token** — Si recibe un 401, intenta refrescar el access token automáticamente
- **Cola de peticiones** — Si hay múltiples peticiones fallando por 401 simultáneamente, solo hace **un** refresh y reintenta todas
- **Timeout configurable** (30s por defecto)
- **Manejo de errores** — Diferencia entre errores de autenticación y errores de red

#### Repositories HTTP

Cada repository del frontend llama al backend vía `apiClient`:

| Repository | Endpoints que consume |
|---|---|
| `UserRepository` | `GET /users/profile`, `POST /users/add` |
| `RecipeRepository` | `GET /recipes/user/:uuid`, `POST /recipes/add`, `DELETE /recipes/delete` |
| `InventoryRepository` | `GET /inventory/:uuid` |
| `ItemRepository` | `POST /items/add`, `PUT /items/update`, `DELETE /items/delete` |
| `AuthRepository` | `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, `POST /auth/verify-account`, `POST /auth/forgot-password`, `POST /auth/verify-reset-code`, `POST /auth/reset-password` |

---

### 5. Inversión de Dependencias (Inversify)

El frontend usa **Inversify** como contenedor de IoC (Inversión de Control):

```typescript
// core/TYPES.ts — Símbolos únicos para cada binding
const TYPES = {
  IItemRepository: Symbol('IItemRepository'),
  IUserRepository: Symbol('IUserRepository'),
  IRecipeRepository: Symbol('IRecipeRepository'),
  IInventoryRepository: Symbol('IInventoryRepository'),
  IAuthRepository: Symbol('IAuthRepository'),
  IItemUseCase: Symbol('IItemUseCase'),
  IUserUseCase: Symbol('IUserUseCase'),
  IRecipeUseCase: Symbol('IRecipeUseCase'),
  IInventoryUseCase: Symbol('IInventoryUseCase'),
};

// core/container.ts — Configuración de bindings
container.bind<IItemRepository>(TYPES.IItemRepository).to(ItemRepository);
container.bind<IRecipeUseCase>(TYPES.IRecipeUseCase).to(RecipeUseCase);
// ... etc
```

**¿Por qué Inversify?** — Permite sustituir las implementaciones sin modificar los Use Cases o ViewModels. Ejemplo: se podría crear un `MockRecipeRepository` para tests sin tocar la lógica de negocio.

---

## 🌐 API REST — Endpoints

Base URL: `http://localhost:3000/api`

### Autenticación

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/auth/login` | ❌ Pública | Login con email y password |
| `POST` | `/auth/refresh` | ❌ Pública | Refrescar access token |
| `POST` | `/auth/logout` | ✅ Bearer | Cerrar sesión (revocar refresh token) |
| `POST` | `/auth/verify-account` | ❌ Pública | Verificar cuenta con código email |
| `POST` | `/auth/forgot-password` | ❌ Pública | Solicitar código de recuperación |
| `POST` | `/auth/verify-reset-code` | ❌ Pública | Verificar código de recuperación |
| `POST` | `/auth/reset-password` | ❌ Pública | Cambiar contraseña con código |

### Usuarios

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/users` | ✅ Bearer | Listar todos los usuarios |
| `GET` | `/users/profile` | ✅ Bearer | Perfil del usuario autenticado |
| `GET` | `/users/:user_uuid` | ✅ Bearer | Obtener usuario por UUID |
| `POST` | `/users/add` | ❌ Pública | Registrar nuevo usuario |
| `DELETE` | `/users/delete` | ✅ Bearer | Eliminar usuario |
| `PUT` | `/users/update` | ✅ Bearer | Actualizar datos del usuario |

### Recetas

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/recipes/user/:user_uuid` | ✅ Bearer | Recetas de un usuario |
| `GET` | `/recipes/:recipe_uuid` | ✅ Bearer | Detalle de una receta |
| `POST` | `/recipes/add` | ✅ Bearer | **Generar receta con IA** |
| `DELETE` | `/recipes/delete` | ✅ Bearer | Eliminar receta |

### Inventario

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `GET` | `/inventory/:user_uuid` | ✅ Bearer | Inventario del usuario (con items) |
| `DELETE` | `/inventory/delete` | ✅ Bearer | Eliminar inventario completo |

### Items

| Método | Endpoint | Auth | Descripción |
|---|---|---|---|
| `POST` | `/items/add` | ✅ Bearer | Añadir item al inventario |
| `DELETE` | `/items/delete` | ✅ Bearer | Eliminar item |
| `PUT` | `/items/update` | ✅ Bearer | Actualizar item (nombre, cantidad, unidad) |

### Formato de respuesta estándar

**Éxito:**
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

**Error:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Descripción del error",
  "timestamp": "2026-05-21T10:00:00.000Z"
}
```

---

## 🗄 Base de Datos — Esquema Completo

### Diagrama Entidad-Relación

```
┌──────────────────────┐       1:N       ┌──────────────────────┐
│        User          │────────────────▶│       Recipe          │
│──────────────────────│                 │──────────────────────│
│ id (PK, UUID)        │                 │ id (PK, UUID)        │
│ role (ENUM)          │                 │ name                 │
│ name                 │                 │ ingredients (TEXT[])  │
│ email (UNIQUE)       │                 │ steps (JSONB)        │
│ password             │                 │ type (ENUM)          │
│ isVerified           │                 │ userId (FK → User)   │
│ verificationCode     │                 │ createdAt            │
│ verificationCodeExp. │                 │ updatedAt            │
│ resetPasswordCode    │                 └──────────────────────┘
│ resetPasswordCodeExp.│
│ createdAt            │       1:1       ┌──────────────────────┐
│ updatedAt            │────────────────▶│     Inventory         │
└──────────────────────┘                 │──────────────────────│
         │                               │ id (PK, UUID)        │
         │ 1:N                           │ userId (FK, UNIQUE)  │
         ▼                               │ createdAt            │
┌──────────────────────┐                 │ updatedAt            │
│    RefreshToken      │                 └──────────┬───────────┘
│──────────────────────│                            │ 1:N
│ id (PK, UUID)        │                            ▼
│ tokenHash (UNIQUE)   │                 ┌──────────────────────┐
│ userId (FK → User)   │                 │        Item           │
│ expiresAt            │                 │──────────────────────│
│ createdAt            │                 │ id (PK, UUID)        │
│ revoked              │                 │ inventoryId (FK)     │
│──────────────────────│                 │ name                 │
│ IDX: tokenHash       │                 │ quantity (INT, def 1)│
│ IDX: userId          │                 │ quantityUnit (ENUM)  │
│ ON DELETE: CASCADE   │                 │ createdAt            │
└──────────────────────┘                 │ updatedAt            │
                                         └──────────────────────┘
```

### Enums de PostgreSQL

```sql
-- Unidades de medida para los items del inventario
CREATE TYPE "QuantityUnit" AS ENUM ('LITRES', 'KILOGRAMS', 'GRAMS', 'UNITS');

-- Tipo de receta (momento del día)
CREATE TYPE "RecipeType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');

-- Roles de usuario
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERUSER');
```

### Script SQL Completo

A continuación, el script SQL completo para crear la base de datos desde cero (resultado de todas las migraciones combinadas):

```sql
-- ============================================================
-- CeroSobras — Script SQL completo de la base de datos
-- Motor: PostgreSQL
-- ORM: Prisma 7.x
-- ============================================================

-- =====================
-- 1. CREAR ENUMS
-- =====================

CREATE TYPE "QuantityUnit" AS ENUM ('LITRES', 'KILOGRAMS', 'GRAMS', 'UNITS');
CREATE TYPE "RecipeType" AS ENUM ('BREAKFAST', 'LUNCH', 'DINNER');
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERUSER');

-- =====================
-- 2. CREAR TABLAS
-- =====================

-- Tabla de usuarios
CREATE TABLE "User" (
    "id"                        TEXT NOT NULL,
    "role"                      "Role" NOT NULL DEFAULT 'USER',
    "name"                      TEXT NOT NULL,
    "email"                     TEXT NOT NULL,
    "password"                  TEXT NOT NULL,
    "isVerified"                BOOLEAN NOT NULL DEFAULT false,
    "verificationCode"          TEXT,
    "verificationCodeExpires"   TIMESTAMP(3),
    "resetPasswordCode"         TEXT,
    "resetPasswordCodeExpires"  TIMESTAMP(3),
    "createdAt"                 TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"                 TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Tabla de inventario (1:1 con User)
CREATE TABLE "Inventory" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- Tabla de recetas (1:N con User)
CREATE TABLE "Recipe" (
    "id"          TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "ingredients" TEXT[],
    "steps"       JSONB NOT NULL,
    "type"        "RecipeType" NOT NULL DEFAULT 'DINNER',
    "userId"      TEXT NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- Tabla de items (ingredientes del inventario, 1:N con Inventory)
CREATE TABLE "Item" (
    "id"           TEXT NOT NULL,
    "inventoryId"  TEXT NOT NULL,
    "name"         TEXT NOT NULL,
    "quantity"     INTEGER NOT NULL DEFAULT 1,
    "quantityUnit" "QuantityUnit" NOT NULL DEFAULT 'UNITS',
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- Tabla de refresh tokens (1:N con User, CASCADE on delete)
CREATE TABLE "RefreshToken" (
    "id"        TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked"   BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- =====================
-- 3. CREAR ÍNDICES
-- =====================

-- Email único para evitar duplicados
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- Un inventario por usuario (relación 1:1)
CREATE UNIQUE INDEX "Inventory_userId_key" ON "Inventory"("userId");

-- Hash del token de refresco (único + índice para búsquedas rápidas)
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_tokenHash_idx" ON "RefreshToken"("tokenHash");
CREATE INDEX "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- =====================
-- 4. CREAR FOREIGN KEYS
-- =====================

-- Inventory → User (1:1)
ALTER TABLE "Inventory"
    ADD CONSTRAINT "Inventory_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Recipe → User (N:1)
ALTER TABLE "Recipe"
    ADD CONSTRAINT "Recipe_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- Item → Inventory (N:1)
ALTER TABLE "Item"
    ADD CONSTRAINT "Item_inventoryId_fkey"
    FOREIGN KEY ("inventoryId") REFERENCES "Inventory"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- RefreshToken → User (N:1, CASCADE)
ALTER TABLE "RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

### Historial de Migraciones

| # | Fecha | Nombre | Cambios |
|---|---|---|---|
| 1 | 2026-04-13 | `update_schema` | Creación inicial: tablas User, Inventory, Recipe (steps como TEXT[]), Item con enums QuantityUnit y RecipeType |
| 2 | 2026-05-03 | `update_recipe_steps_to_json` | Cambio de `steps TEXT[]` a `steps JSONB` para soportar objetos `{instruction, timerMinutes}` |
| 3 | 2026-05-09 | `add_auth_fields` | Añade campos de verificación y reset de password al User (`isVerified`, `verificationCode`, etc.) |
| 4 | 2026-05-10 | `add_refresh_token` | Crea tabla `RefreshToken` con índices y FK CASCADE |
| 5 | 2026-05-13 | `add_user_role` | Añade enum `Role` y campo `role` al User (default: 'USER') |

---

## 🔐 Autenticación y Seguridad

### Flujo completo de autenticación

```
┌──────────────────────────────────────────────────────────────┐
│                    FLUJO DE AUTENTICACIÓN                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. REGISTRO                                                 │
│     POST /api/users/add {name, email, password}              │
│     → Hash bcrypt (10 rounds)                                │
│     → Crear usuario + inventario vacío                       │
│     → Devolver UserResponseDTO                               │
│                                                              │
│  2. LOGIN                                                    │
│     POST /api/auth/login {email, password}                   │
│     → Buscar usuario por email                               │
│     → Comparar password con bcrypt                           │
│     → Generar access_token (JWT, 15min)                      │
│     → Generar refresh_token (64 bytes random hex)            │
│     → Guardar hash SHA-256 del refresh_token en DB           │
│     → Devolver ambos tokens + datos del usuario              │
│                                                              │
│  3. PETICIONES AUTENTICADAS                                  │
│     Header: Authorization: Bearer <access_token>             │
│     → JwtAuthGuard valida el token                           │
│     → JwtStrategy extrae {user_uuid, email, role}            │
│     → @CurrentUser() inyecta los datos en el controller      │
│                                                              │
│  4. REFRESH (cuando access_token expira)                     │
│     POST /api/auth/refresh {refresh_token}                   │
│     → Hash SHA-256 del token recibido                        │
│     → Buscar en DB por hash                                  │
│     → Verificar no revocado y no expirado                    │
│     → Revocar el anterior (rotación)                         │
│     → Generar nuevos access + refresh tokens                 │
│                                                              │
│  5. LOGOUT                                                   │
│     POST /api/auth/logout {refresh_token}                    │
│     → Revocar el refresh token específico                    │
│     → Revocar todos los tokens del usuario (opcional)        │
│                                                              │
│  6. RECUPERACIÓN DE CONTRASEÑA                               │
│     POST /api/auth/forgot-password {email}                   │
│     → Generar código de 6 dígitos                            │
│     → Guardar con expiración de 1 hora                       │
│     → Enviar por email (Resend/SMTP)                         │
│                                                              │
│     POST /api/auth/verify-reset-code {email, code}           │
│     → Verificar código válido y no expirado                  │
│                                                              │
│     POST /api/auth/reset-password {email, code, newPassword} │
│     → Hash bcrypt de la nueva contraseña                     │
│     → Actualizar password en DB                              │
│     → Revocar TODOS los refresh tokens del usuario           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Tokens almacenados en el frontend

Los tokens se guardan en **Expo Secure Store** (cifrado nativo del dispositivo):
- `access_token` → Se envía en cada petición como Bearer Token
- `refresh_token` → Se usa solo para renovar el access_token

### Refresh automático en el ApiClient

El `ApiClient` del frontend implementa un mecanismo transparente:
1. Si una petición recibe **401**, intenta refrescar el token.
2. Si el refresh funciona, **reintenta** la petición original automáticamente.
3. Si hay varias peticiones fallando al mismo tiempo, las encola y solo hace **un** refresh (evita race conditions).
4. Si el refresh falla con 401/403, limpia los tokens → el usuario ve la pantalla de login.

---

## 🤖 Servicio de IA (Google Gemini)

### Configuración

```env
GEMINI_API_KEY=tu-api-key-aqui
GEMINI_MODEL=gemini-3-flash    # modelo usado (configurable)
```

### Cómo funciona la generación

1. El frontend construye un **prompt** con:
   - Tipo de receta (Desayuno/Comida/Cena)
   - Número de personas
   - Preferencias dietéticas (vegetariano, sin gluten, etc.)
   - Ingredientes seleccionados del inventario (con cantidades y unidades)

2. El backend envía el prompt a Gemini con un **responseSchema** que fuerza la estructura:

```json
{
  "name": "Nombre creativo de la receta",
  "ingredients": ["200g de pollo", "1 cebolla", "..."],
  "steps": [
    { "instruction": "Cortar el pollo en trozos", "timerMinutes": 0 },
    { "instruction": "Cocinar a fuego medio", "timerMinutes": 15 },
    { "instruction": "Dejar reposar", "timerMinutes": 5 }
  ]
}
```

3. El backend **valida** la respuesta antes de guardarla:
   - `name` debe existir y ser string
   - `ingredients` debe ser un array no vacío
   - `steps` debe tener al menos un paso con `instruction` válida
   - `timerMinutes` se normaliza a 0 si no es número

4. La receta validada se persiste en PostgreSQL y se devuelve al frontend.

---

## ⚙️ Variables de Entorno

### Backend (`apps/backend/.env`)

```env
# Base de datos
DATABASE_URL=postgresql://user:password@host:5432/dbname

# JWT
JWT_SECRET=tu-secreto-jwt-seguro

# Google Gemini AI
GEMINI_API_KEY=tu-api-key-de-gemini
GEMINI_MODEL=gemini-3-flash

# Email (opción 1: Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM=CeroSobras <no-reply@tudominio.com>

# Email (opción 2: SMTP)
SMTP_HOST=smtp.ejemplo.com
SMTP_PORT=587
SMTP_USER=tu-usuario
SMTP_PASSWORD=tu-password
SMTP_FROM=CeroSobras <no-reply@tudominio.com>

# Límites
DAILY_RECIPE_LIMIT=2    # Recetas por día para usuarios normales

# Servidor
PORT=3000
```

### Frontend (`apps/frontend/app-front/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos previos

- **Node.js** ≥ 18
- **pnpm** ≥ 10.x
- **PostgreSQL** ≥ 14
- **Cuenta de Google AI Studio** (para la API key de Gemini)

### 1. Clonar e instalar dependencias

```bash
git clone <url-del-repositorio>
cd TFG
pnpm install
```

### 2. Configurar variables de entorno

```bash
# Copiar y editar el .env del backend
cp apps/backend/.env.example apps/backend/.env
# → Rellenar DATABASE_URL, JWT_SECRET, GEMINI_API_KEY, etc.

# Copiar y editar el .env del frontend
cp apps/frontend/app-front/.env.example apps/frontend/app-front/.env
# → Configurar EXPO_PUBLIC_API_URL
```

### 3. Inicializar la base de datos

```bash
cd apps/backend
npx prisma migrate deploy    # Aplica todas las migraciones
npx prisma generate          # Genera el cliente de Prisma
```

### 4. Iniciar el backend

```bash
cd apps/backend
pnpm run start:dev    # Inicia en modo watch (desarrollo)
```

La API estará disponible en `http://localhost:3000/api`
Documentación Swagger en `http://localhost:3000/api/docs`

### 5. Iniciar el frontend

```bash
cd apps/frontend/app-front
npx expo start    # Inicia el servidor de desarrollo de Expo
```

Escanear el QR con **Expo Go** (Android/iOS) o pulsar `a` para abrir en emulador Android.

### 6. Iniciar todo el monorepo a la vez

```bash
# Desde la raíz del proyecto
pnpm dev    # Usa Turborepo para iniciar backend + frontend en paralelo
```

---

## 📄 Licencia

Este proyecto fue desarrollado como **Trabajo de Fin de Grado (TFG)**.

---

> _"CeroSobras nace con la misión de reducir el desperdicio de alimentos, ayudando a las personas a cocinar con lo que ya tienen en casa, aprovechando la inteligencia artificial para generar recetas personalizadas."_
