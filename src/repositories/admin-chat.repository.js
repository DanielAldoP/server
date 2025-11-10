const BaseRepository = require('./base.repository');
const { AdminChat, AdminChatMessage, User } = require('../models');

class AdminChatRepository extends BaseRepository {
  constructor() {
    super();
    this.chatModel = AdminChat;
    this.messageModel = AdminChatMessage;
  }

  async findChats(page = 1, limit = 20, filters = {}) {
    const whereClause = this.buildWhereClause(filters);

    const offset = (page - 1) * limit;
    const { count, rows } = await AdminChat.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        },
        {
          model: AdminChatMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_message_at', 'DESC']]
    });

    return {
      chats: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async findChatById(chat_id, user_id = null, user_role = null) {
    const chat = await AdminChat.findByPk(chat_id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!chat) {
      throw new Error('Chat not found');
    }

    // Check permissions (admin or chat owner)
    if (user_role !== 'admin' && chat.user_id !== user_id) {
      throw new Error('Access denied');
    }

    return chat;
  }

  async findChatMessages(chat_id, user_id = null, user_role = null, page = 1, limit = 50) {
    const chat = await this.findChatById(chat_id, user_id, user_role);

    const offset = (page - 1) * limit;
    const { count, rows } = await AdminChatMessage.findAndCountAll({
      where: { chat_id },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'ASC']]
    });

    // Mark messages as read if user is admin
    if (user_role === 'admin') {
      await AdminChatMessage.update(
        { is_read: true },
        {
          where: {
            chat_id,
            sender_type: 'user',
            is_read: false
          }
        }
      );
    }

    return {
      chat,
      messages: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async createChat(user_id, subject) {
    return await this.transaction(async (t) => {
      const chat = await AdminChat.create({
        user_id,
        subject
      }, { transaction: t });

      return await this.findChatById(chat.id);
    });
  }

  async createMessage(chat_id, sender_id, sender_type, message) {
    return await this.transaction(async (t) => {
      // Verify chat exists and check permissions
      const chat = await AdminChat.findByPk(chat_id, { transaction: t });
      if (!chat) {
        throw new Error('Chat not found');
      }

      // Create message
      const chatMessage = await AdminChatMessage.create({
        chat_id,
        sender_id,
        sender_type,
        message
      }, { transaction: t });

      // Update chat last message time
      await AdminChat.update(
        { last_message_at: new Date() },
        { where: { id: chat_id }, transaction: t }
      );

      return chatMessage;
    });
  }

  async updateChatStatus(chat_id, status) {
    return await AdminChat.update(
      { status },
      { where: { id: chat_id } }
    );
  }

  async findUnreadMessageCount(user_id, user_role) {
    if (user_role !== 'admin') {
      return 0;
    }

    return await AdminChatMessage.count({
      where: {
        sender_type: 'user',
        is_read: false
      },
      include: [
        {
          model: AdminChat,
          as: 'chat',
          required: true
        }
      ]
    });
  }

  async markMessagesAsRead(chat_id, sender_type = 'user') {
    return await AdminChatMessage.update(
      { is_read: true },
      {
        where: {
          chat_id,
          sender_type,
          is_read: false
        }
      }
    );
  }

  async findChatsByUser(user_id, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const { count, rows } = await AdminChat.findAndCountAll({
      where: { user_id },
      include: [
        {
          model: AdminChatMessage,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['last_message_at', 'DESC']]
    });

    return {
      chats: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        totalPages: Math.ceil(count / limit)
      }
    };
  }

  async closeChat(chat_id) {
    return await this.updateChatStatus(chat_id, 'closed');
  }

  async deleteChat(chat_id) {
    return await this.transaction(async (t) => {
      // Delete all messages first
      await AdminChatMessage.destroy({
        where: { chat_id },
        transaction: t
      });

      // Delete the chat
      return await AdminChat.destroy({
        where: { id: chat_id },
        transaction: t
      });
    });
  }

  async transaction(callback) {
    const sequelize = require('../models').sequelize;
    return await sequelize.transaction(callback);
  }

  buildWhereClause(filters) {
    const whereClause = {};

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null) {
        whereClause[key] = filters[key];
      }
    });

    return whereClause;
  }
}

module.exports = new AdminChatRepository();