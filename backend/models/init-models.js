var DataTypes = require("sequelize").DataTypes;
var _centros = require("./centros");
var _restricciones = require("./restricciones");
var _centros_restricciones = require("./centros_restricciones");

function initModels(sequelize) {
  var centros = _centros(sequelize, DataTypes);
  var restricciones = _restricciones(sequelize, DataTypes);
  var centros_restricciones = _centros_restricciones(sequelize, DataTypes);

  // Definir la relación muchos-a-muchos
  centros.belongsToMany(restricciones, {
    through: centros_restricciones,
    foreignKey: 'id_centro',
    otherKey: 'id_restriccion',
    as: 'restricciones'
  });
  restricciones.belongsToMany(centros, {
    through: centros_restricciones,
    foreignKey: 'id_restriccion',
    otherKey: 'id_centro',
    as: 'centros'
  });

  return {
    centros,
    restricciones,
    centros_restricciones,
  };
}

module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;