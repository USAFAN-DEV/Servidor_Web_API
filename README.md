# Servidor_Web_API
API REST para Servidor Web
Este proyecto implementa una API REST utilizando Node.js y Express. Está diseñado para ser una base para desarrollar aplicaciones web que necesiten interactuar con un servidor backend, permitiendo la gestión de recursos y datos de forma eficiente.

## 📄 Descripción
Esta API proporciona un conjunto de endpoints para realizar operaciones CRUD (Crear, Leer, Actualizar, Eliminar) sobre diferentes recursos, como imágenes y archivos. Está pensada para ser una base que puedes extender para desarrollar más funcionalidades según los requerimientos del proyecto.

### Funcionalidades principales:
- CRUD para recursos estáticos (como imágenes).
- Manejo de rutas con Express.
- Archivos estáticos accesibles públicamente a través de URLs.
- Uso de middlewares para manejar peticiones y respuestas.
### 🚀 Tecnologías utilizadas
- Node.js: Plataforma de backend para ejecutar JavaScript.
- Express: Framework minimalista para crear servidores web y APIs en Node.js.
- JSON: Formato de intercambio de datos.
- Mongoose (si se usa en el proyecto para bases de datos MongoDB): Librería para interactuar con bases de datos MongoDB.
## 🔧 Instalación
Clona el repositorio:

```bash
git clone https://github.com/tu-usuario/servidor-web-api.git
cd servidor-web-api
```
Instala las dependencias:
```bash
npm install
```
Configura el archivo .env (si es necesario). Puedes usar un archivo .env para configurar variables de entorno como las claves de API, puerto, etc.

Ejecuta el servidor:
```bash
npm start
```

📡 Endpoints
1. GET /imagenes
Descripción: Obtiene todas las imágenes almacenadas en el servidor.
Respuesta:
json
Copiar
Editar
[
  {
    "id": 1,
    "url": "/imagenes/imagen1.jpg"
  },
  {
    "id": 2,
    "url": "/imagenes/imagen2.png"
  }
]
2. GET /imagenes/:id
Descripción: Obtiene una imagen específica por su id.
Parámetros: id (ID de la imagen).
Respuesta: La imagen solicitada será servida como archivo estático.
3. POST /imagenes
Descripción: Permite subir una nueva imagen al servidor.
Cuerpo de la solicitud: La imagen debe enviarse como multipart/form-data.
Respuesta:
json
Copiar
Editar
{
  "id": 3,
  "url": "/imagenes/nueva_imagen.jpg"
}
4. DELETE /imagenes/:id
Descripción: Elimina una imagen específica.
Parámetros: id (ID de la imagen).
Respuesta:
json
Copiar
Editar
{
  "mensaje": "Imagen eliminada exitosamente"
}
📂 Estructura del Proyecto
bash
Copiar
Editar
/mi-proyecto
│── /src
│   ├── /storage           # Carpeta donde se almacenan las imágenes
│   ├── server.js          # Configuración principal del servidor
│── package.json           # Dependencias y scripts del proyecto
│── .env                   # Variables de entorno (si es necesario)
🛠️ Uso de Archivos Estáticos
Se utiliza express.static para hacer que los archivos dentro de la carpeta /src/storage estén accesibles públicamente. Esto permite servir imágenes, archivos CSS, JS, y otros recursos estáticos.

javascript
Copiar
Editar
app.use(express.static('src/storage'));
📋 Requisitos
Node.js: Versión 14 o superior.
npm: El gestor de paquetes de Node.js.
MongoDB (opcional, si tu proyecto usa bases de datos).
📝 Notas
Este proyecto está destinado como parte de la asignatura de Servidor Web y está orientado a la creación de una API REST básica.
Puedes extender este proyecto para agregar más rutas o funcionalidad como autenticación de usuarios, base de datos, etc.
