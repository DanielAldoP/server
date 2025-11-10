module.exports = (sequelize, DataTypes) => {
  const DailyMenu = sequelize.define('DailyMenu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    menu_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'menu_id',
      references: {
        model: 'menus',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    day_of_week: {
      type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
      allowNull: false,
      field: 'day_of_week'
    },
    created_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
      field: 'created_at'
    },
    updated_at: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: () => Math.floor(Date.now() / 1000),
      field: 'updated_at'
    }
  }, {
    tableName: 'daily_menus',
    timestamps: false,
    hooks: {
      beforeCreate: (instance, options) => {
        const now = Math.floor(Date.now() / 1000);
        instance.created_at = now;
        instance.updated_at = now;
      },
      beforeUpdate: (instance, options) => {
        if (instance.changed()) {
          instance.updated_at = Math.floor(Date.now() / 1000);
        }
      }
    },
    indexes: [
      {
        unique: true,
        fields: ['menu_id', 'day_of_week']
      }
    ]
  });

  DailyMenu.associate = function(models) {
    DailyMenu.belongsTo(models.Menu, { foreignKey: 'menu_id', as: 'menu' });
  };

  return DailyMenu;
};