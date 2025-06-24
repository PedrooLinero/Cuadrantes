const Respuesta = require("../utils/respuesta.js");
const { logMensaje } = require("../utils/logger.js");
const initModels = require("../models/init-models.js").initModels;
const sequelize = require("../config/sequelize.js");

// Inicializar modelos
const models = initModels(sequelize);
const Centro = models.centros;
const Restriccion = models.restricciones;

class CentrosRestriccionesController {
  // GET /api/centros
  async getAllCentros(req, res) {
    try {
      const centros = await Centro.findAll({
        attributes: [
          "id",
          "nombre_centro",
          "id_restriccion",
          "fecha_creacion",
        ],
      });
      return res.status(200).json(Respuesta.exito(centros));
    } catch (err) {
      logMensaje(`Error al obtener centros: ${err.message}, Stack: ${err.stack}`, "error");
      return res
        .status(500)
        .json(Respuesta.error(null, "Error al obtener los centros"));
    }
  }

  // GET /api/restricciones
  async getAllRestricciones(req, res) {
    try {
      const restricciones = await Restriccion.findAll({
        attributes: [
          "id",
          "codigo",
          "descripcion",
          "fecha_creacion",
        ],
      });
      return res.status(200).json(Respuesta.exito(restricciones));
    } catch (err) {
      logMensaje(`Error al obtener restricciones: ${err.message}, Stack: ${err.stack}`, "error");
      return res
        .status(500)
        .json(Respuesta.error(null, "Error al obtener las restricciones"));
    }
  }
}

module.exports = new CentrosRestriccionesController();