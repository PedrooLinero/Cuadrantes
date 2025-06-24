var DataTypes = require("sequelize").DataTypes;
var _centros = require("./centros");
var _restricciones = require("./restricciones");

function initModels(sequelize) {
  var centros = _centros(sequelize, DataTypes);
  var restricciones = _restricciones(sequelize, DataTypes);

  // Definir la relación entre centros y restricciones
  centros.belongsTo(restricciones, { as: "restriccion", foreignKey: "id_restriccion" });
  restricciones.hasMany(centros, { as: "centros", foreignKey: "id_restriccion" });

  return {
    centros,
    restricciones,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;