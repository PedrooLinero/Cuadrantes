// backend/routes/fichajesRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const cuadranteController = require("../controller/cuadranteController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../uploads/");
    cb(null, uploadPath); // Establecer la ruta de destino
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = file.originalname;
    cb(null, uniqueSuffix); // Nombre del archivo guardado
  },
});

const upload = multer({ storage });

// Nueva ruta para manejar un solo archivo llamado "cuadrante"
router.post(
  "/",
  upload.single("cuadrante"), // Espera un solo archivo con el nombre "cuadrante"
  cuadranteController.generarCuadrante
);

// // Ruta original para dos archivos (opcional, puedes eliminarla si no la necesitas)
// router.post(
//   "/",
//   upload.fields([
//     { name: "fichero1", maxCount: 1 },
//     { name: "fichero2", maxCount: 1 },
//   ]),
//   cuadranteController.guardarFicheros
// );

module.exports = router;