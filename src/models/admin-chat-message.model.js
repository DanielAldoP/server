module.exports = (sequelize, DataTypes) => {
  const AdminChatMessage = sequelize.define('AdminChatMessage', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id'
    },
    chat_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'chat_id',
      references: {
        model: 'admin_chats',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sender_id',
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    sender_type: {
      type: DataTypes.ENUM('user', 'admin'),
      allowNull: false,
      field: 'sender_type'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'message'
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_read'
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
    tableName: 'admin_chat_messages',
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
    }
  });

  AdminChatMessage.associate = function(models) {
    AdminChatMessage.belongsTo(models.AdminChat, { foreignKey: 'chat_id', as: 'chat' });
    AdminChatMessage.belongsTo(models.User, { foreignKey: 'sender_id', as: 'sender' });
  };

  return AdminChatMessage;
};