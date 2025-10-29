import { getItem, putItem, updateItem, queryItems } from './dynamoHelpers.js';
import { TABLES } from '../config/db.js';

/**
 * User Model - DynamoDB implementation
 * PK: userId (Clerk user ID)
 * Attributes: name, email, resume, image, createdAt, updatedAt
 */

export default {
  // Find user by ID
  async findById(userId) {
    const item = await getItem(TABLES.USERS, userId, 'PROFILE');
    if (!item) return null;
    return this.formatUser(item);
  },

  // Find user by email
  async findOne(filters) {
    if (filters._id) {
      return this.findById(filters._id);
    }
    // Without a GSI on email, avoid full table scans in hot paths.
    return null;
  },

  // Create new user
  async create(userData) {
    const item = {
      PK: userData._id || userData.id,
      SK: 'PROFILE',
      name: userData.name,
      email: userData.email,
      resume: userData.resume || '',
      image: userData.image,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putItem(TABLES.USERS, item);
    return this.formatUser(item);
  },

  // Update user
  async findByIdAndUpdate(userId, updates) {
    const updated = await updateItem(TABLES.USERS, userId, 'PROFILE', updates);
    return this.formatUser(updated);
  },

  // Format DynamoDB item to match Mongoose schema format
  formatUser(item) {
    if (!item) return null;
    return {
      _id: item.PK,
      id: item.PK,
      name: item.name,
      email: item.email,
      resume: item.resume || '',
      image: item.image,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },
};
