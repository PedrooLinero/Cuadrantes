const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('centros_restricciones', {
    id_centro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'centros',
        key: 'id'
      }
    },
    id_restriccion: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'restricciones',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'centros_restricciones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_centro" },
          { name: "id_restriccion" }
        ]
      }
    ]
  });
};