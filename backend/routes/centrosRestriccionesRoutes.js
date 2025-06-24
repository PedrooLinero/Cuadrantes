// File: backend/routes/centrosRestriccionesRoutes.js
const express = require("express");
const router = express.Router();
const centrosRestriccionesController = require("../controller/centrosRestriccionesController.js");

// GET all centros 
router.get("/centros", centrosRestriccionesController.getAllCentros);
// GET all restricciones
router.get("/restricciones", centrosRestriccionesController.getAllRestricciones);

module.exports = router;