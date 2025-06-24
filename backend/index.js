require("dotenv").config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const express = require("express");
const cors = require("cors");
const path = require("path");
const cuadranteRoutes = require("./routes/cuadranteRoutes");
const centrosRestriccionesRoutes = require("./routes/centrosRestriccionesRoutes");
const config = require("./config/config");

const app = express();

// Configurar middleware CORS
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Configurar rutas de la API
app.use("/api/cuadrante", cuadranteRoutes);
app.use("/api", centrosRestriccionesRoutes);
app.use("/api", centrosRestriccionesRoutes);

// Manejar rutas no encontradas (404) para la API
app.use("/api/*", (req, res) => {
  res.status(404).json({
    success: false,
    data: null,
    message: `Ruta ${req.method} ${req.url} no encontrada`,
  });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    data: null,
    message: "Error interno del servidor",
  });
});

// Iniciar el servidor solo si no estamos en modo de prueba
const port = config.port || 3000;
if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`🚀 Servidor escuchando en el puerto ${port}`);
  });
}

module.exports = app;