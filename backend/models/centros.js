const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('centros', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre_centro: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    id_restriccion: {
      type: DataTypes.INTEGER,
      allowNull: true, // Puede ser null si no hay restricción asignada
      references: {
        model: 'restricciones',
        key: 'id'
      }
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    sequelize,
    tableName: 'centros',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" }
        ]
      },
      {
        name: "id_restriccion",
        using: "BTREE",
        fields: [
          { name: "id_restriccion" }
        ]
      }
    ]
  });
};