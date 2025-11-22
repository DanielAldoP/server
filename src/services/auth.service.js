const { userRepository } = require('../repositories');
const { generateToken } = require('../helpers/jwt.helper');
const {
  UnauthorizedError,
  ConflictError,
  NotFoundError
} = require('../helpers/error.helper');

class AuthService {
  static async register(userData) {
    const { name, email, password, phone_number, role = 'customer' } = userData;

    // Check if user already exists
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Create user with wallet
    const user = await userRepository.createWithWallet({
      name,
      email,
      password,
      phone_number,
      role
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role,
        is_active: user.is_active
      },
      token
    };
  }

  static async login(email, password) {
    // Find user with wallet
    const user = await userRepository.findByEmailWithWallet(email);

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        city: user.city,
        role: user.role,
        is_active: user.is_active,
        wallet: user.wallet
      },
      token
    };
  }

  static async getProfile(userId) {
    const user = await userRepository.findByIdWithWallet(userId);

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  static async updateProfile(userId, updateData) {
    // Update user with validated data
    await userRepository.update(updateData, { id: userId });

    // Get updated user
    return await userRepository.findById(userId, {
      attributes: { exclude: ['password'] }
    });
  }

  static async changePassword(userId, currentPassword, newPassword) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isCurrentPasswordValid = await user.validatePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Update password
    await userRepository.update({ password: newPassword }, { id: userId });

    return { message: 'Password changed successfully' };
  }

  static async validateUser(userId) {
    const user = await userRepository.findById(userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    if (!user.is_active) {
      throw new UnauthorizedError('Account is deactivated');
    }

    return user;
  }

  static async getUsersByRole(role, page = 1, limit = 20, filters = {}) {
    return await userRepository.findByRole(role, page, limit, filters);
  }

  static async getUsersByCity(city, page = 1, limit = 20, filters = {}) {
    return await userRepository.findByCity(city, page, limit, filters);
  }

  static async getAllAdmins() {
    return await userRepository.findAdmins();
  }

  static async updateUserStatus(userId, is_active) {
    return await userRepository.updateStatus(userId, is_active);
  }

  static async getUserStats() {
    return await userRepository.getUserStats();
  }
}

module.exports = AuthService;