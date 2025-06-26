// backend/routes/fichajesRoutes.js

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const CuadranteController = require("../controller/cuadranteController");

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
  "/leer-restricciones",
  upload.single("cuadrante"), // Espera un solo archivo con el nombre "cuadrante"
  CuadranteController.leerRestricciones
);

module.exports = router;