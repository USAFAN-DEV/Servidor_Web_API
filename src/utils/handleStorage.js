const multer = require("multer");
const memory = multer.memoryStorage();
const uploadMiddlewareMemory = multer({ storage: memory });

/**
 * Middleware de Multer para almacenar archivos en memoria.
 *
 * @constant {multer.Multer} uploadMiddlewareMemory - Middleware que almacena los archivos en memoria.
 */
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    //Pasan argumentos automáticamente
    const pathStorage = __dirname + "/../storage";
    callback(null, pathStorage); //error y destination
  },
  filename: function (req, file, callback) {
    //Sobreescribimos o renombramos
    //Tienen extensión jpg, pdf, mp4
    const ext = file.originalname.split(".").pop(); //el último valor
    const filename = "file-" + Date.now() + "." + ext;
    callback(null, filename);
  },
});

/**
 * Middleware de Multer para almacenar archivos en disco con configuración personalizada.
 *
 * - Almacena los archivos en la carpeta `/storage`.
 * - Renombra los archivos con un prefijo `file-` seguido de la marca de tiempo.
 * - Limita el tamaño máximo del archivo a 5MB.
 *
 * @constant {multer.Multer} uploadMiddleware - Middleware para manejar la subida de archivos al disco.
 */
const uploadMiddleware = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); //Middleware entre la ruta y el controlador , 5MB

module.exports = { uploadMiddleware, uploadMiddlewareMemory };
