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
          "fecha_creacion",
        ],
        include: [{
          model: Restriccion,
          as: "restricciones",
          attributes: ["id", "codigo", "descripcion"],
          through: { attributes: [] }
        }]
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

  // POST /api/centros
  async createCentro(req, res) {
    const { nombre_centro, id_restriccion } = req.body;

    // Validaciones
    if (!nombre_centro) {
      return res.status(400).json(Respuesta.error(null, "El nombre del centro es requerido."));
    }
    if (!id_restriccion || !Array.isArray(id_restriccion) || id_restriccion.length === 0) {
      return res.status(400).json(Respuesta.error(null, "Al menos una restricción es requerida."));
    }

    const transaction = await sequelize.transaction();

    try {
      // Crear el centro
      const nuevoCentro = await Centro.create({ nombre_centro }, { transaction });

      // Asociar las restricciones al centro
      await nuevoCentro.setRestricciones(id_restriccion, { transaction });

      // Confirmar la transacción
      await transaction.commit();

      // Obtener el centro creado con sus restricciones para devolverlo
      const centroCreado = await Centro.findByPk(nuevoCentro.id, {
        include: [{
          model: Restriccion,
          as: "restricciones",
          attributes: ["id", "codigo", "descripcion"]
        }]
      });

      return res.status(201).json(Respuesta.exito(centroCreado, "Centro creado con éxito"));
    } catch (err) {
      // Revertir la transacción en caso de error
      await transaction.rollback();
      logMensaje(`Error al crear centro: ${err.message}, Stack: ${err.stack}`, "error");
      return res
        .status(500)
        .json(Respuesta.error(null, "Error al crear el centro"));
    }
  }
}

module.exports = new CentrosRestriccionesController();