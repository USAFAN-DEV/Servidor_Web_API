# Servidor_Web_API

API REST para Servidor Web  
Este proyecto implementa una API REST utilizando Node.js y Express. Está diseñado para ser una base para desarrollar aplicaciones web que necesiten interactuar con un servidor backend, permitiendo la gestión de recursos y datos de forma eficiente.

## 📄 Descripción

Esta API proporciona un conjunto de endpoints para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre diferentes recursos.

### Funcionalidades principales:

- Manejo de rutas con Express.
- Archivos estáticos accesibles públicamente a través de URLs.
- Uso de middlewares para manejar peticiones y respuestas.
- Uso de MongoDB como base de datos.

### 🚀 Tecnologías utilizadas

- **Node.js**: Plataforma de backend para ejecutar JavaScript.
- **Express**: Framework minimalista para crear servidores web y APIs en Node.js.
- **JSON**: Formato de intercambio de datos.
- **Mongoose**: Librería para interactuar con bases de datos MongoDB.

## 🔧 Instalación

1. Clona el repositorio:

   ```bash
   git clone https://github.com/tu-usuario/servidor-web-api.git
   cd servidor-web-api
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Configura el archivo `.env` (Ejemplo en `.envExample`).

4. Ejecuta el servidor:

   ```bash
   npm start
   ```

## 📡 Endpoints

En el archivo `test.http` hay ejemplos de cada endpoint.

### 1. User

- **POST** `http://localhost:3000/api/user/register`

  - Registra un nuevo usuario en la base de datos y crea un documento en `userverifications` para gestionar la verificación del usuario.
  - **Responses**:
    - `201`: Usuario creado.
    - `409`: Email repetido.
    - `500`: Error del servidor.

- **POST** `http://localhost:3000/api/user/login`

  - Inicia sesión de un usuario autenticado. Verifica que el email exista, la contraseña sea correcta y que la cuenta esté verificada.
  - **Responses**:
    - `200`: Inicio de sesión exitoso. Devuelve un token de autenticación.
    - `401`: El usuario no ha verificado su email.
    - `403`: Email o contraseña incorrectos.
    - `404`: El usuario no existe.
    - `500`: Error del servidor.

- **GET** `http://localhost:3000/api/user/me`

  - Obtiene la información del usuario autenticado en base al token JWT.
  - La información incluye los datos del usuario y su logo (si existe).
  - **Responses**:
    - `200`: Usuario encontrado.
    - `404`: El usuario no existe.
    - `500`: Error del servidor.

- **PATCH** `http://localhost:3000/api/user/complete-info`
  - Actualiza la información personal del usuario autenticado (nombre, apellidos y NIF).
  - Requiere autenticación con token JWT.
  - **Responses**:
    - `200`: Información actualizada correctamente.
    - `404`: El usuario no existe.
    - `500`: Error del servidor.

### 2. Verificación

- **POST** `http://localhost:3000/api/verification`
  - Verifica un usuario mediante un código de verificación enviado por correo electrónico.
  - Si el código es correcto, se marca el usuario como verificado.
  - Si el código ha expirado o es incorrecto, se maneja el error adecuadamente.
  - **Responses**:
    - `200`: Usuario verificado correctamente o código reenviado si no había verificación previa.
    - `400`: Código de verificación incorrecto.
    - `404`: El usuario no existe en la base de datos.
    - `409`: El usuario ya estaba verificado.
    - `410`: El código ha expirado y se ha generado uno nuevo.
    - `423`: El usuario está bloqueado por demasiados intentos fallidos.
    - `500`: Error del servidor al intentar verificar el usuario.

### 3. Company

- **PUT** `http://localhost:3000/api/company/create-company`

  - Crea una nueva empresa y la asocia a un jefe existente en la base de datos.
  - **Responses**:
    - `201`: Empresa creada con éxito.
    - `404`: El jefe no existe en la base de datos.
    - `409`: CIF repetido. La empresa ya está registrada.
    - `500`: Error del servidor al crear la empresa.

- **GET** `http://localhost:3000/api/company/my-company?cif=BXXXXXXXX`

  - Obtiene la información de una empresa a partir de su CIF. Solo el jefe de la empresa puede acceder a esta información.
  - **Parámetros**:
    - `cif` (query param) → El CIF de la empresa a consultar.
  - **Responses**:
    - `200`: Empresa encontrada correctamente.
    - `400`: Falta el CIF en la solicitud.
    - `403`: Solo el jefe puede ver la empresa.
    - `404`: La empresa o el usuario no existen en la base de datos.
    - `500`: Error del servidor al buscar la empresa.

- **PATCH** `http://localhost:3000/api/company/add-user-company`
  - Añade empleados a una empresa existente en la base de datos. Solo el jefe de la empresa puede realizar esta acción.
  - **Responses**:
    - `200`: Empleados añadidos correctamente.
    - `200`: Todos los empleados ya estaban registrados en la empresa.
    - `403`: Solo el jefe puede añadir empleados.
    - `404`: La empresa no existe.
    - `404`: Algunos usuarios no existen en la base de datos.
    - `500`: Error del servidor al añadir empleados.

### 4. Logo

- **POST** `http://localhost:3000/api/logo`
  - Crea un nuevo logo y lo asocia a un usuario autenticado.
  - **Body** (multipart/form-data):
    - `file` (archivo) → Imagen del logo a cargar.
  - **Responses**:
    - `201`: Logo creado y asociado al usuario correctamente.
    - `404`: No se ha podido añadir el logo al usuario.
    - `500`: Error del servidor al registrar el logo.

#### También aparecen los errores **403** o **401** si hay problemas de autenticación (`/middleware/session.js`).
