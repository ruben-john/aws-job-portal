import { getItem, putItem, updateItem, scanItems } from './dynamoHelpers.js';
import { TABLES } from '../config/db.js';
import crypto from 'crypto';

/**
 * Company Model - DynamoDB implementation
 * PK: email (unique identifier)
 * SK: "PROFILE"
 * Attributes: name, email, image, password, createdAt, updatedAt
 */

// Generate companyId from email for consistency
function generateCompanyId(email) {
  return crypto.createHash('md5').update(email).digest('hex').substring(0, 24);
}

export default {
  // Find company by email
  async findOne(filters) {
    if (filters.email) {
      const item = await getItem(TABLES.COMPANIES, filters.email, 'PROFILE');
      return item ? this.formatCompany(item) : null;
    }
    if (filters._id) {
      // If searching by _id, scan for companyId match (or use email as PK)
      const items = await scanItems(TABLES.COMPANIES, {
        filter: 'companyId = :id',
        values: { ':id': filters._id },
      });
      return items.length > 0 ? this.formatCompany(items[0]) : null;
    }
    return null;
  },

  // Find company by ID
  async findById(id) {
    // Try as email first
    let item = await getItem(TABLES.COMPANIES, id, 'PROFILE');
    if (!item) {
      // Fallback: scan by companyId
      const items = await scanItems(TABLES.COMPANIES, {
        filter: 'companyId = :id',
        values: { ':id': id },
      });
      item = items.length > 0 ? items[0] : null;
    }
    return item ? this.formatCompany(item) : null;
  },

  // Create new company
  async create(companyData) {
    const companyId = generateCompanyId(companyData.email);
    const item = {
      PK: companyData.email,
      SK: 'PROFILE',
      companyId,
      name: companyData.name,
      email: companyData.email,
      image: companyData.image,
      password: companyData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putItem(TABLES.COMPANIES, item);
    return this.formatCompany(item);
  },

  // Update company
  async findByIdAndUpdate(email, updates) {
    const updated = await updateItem(TABLES.COMPANIES, email, 'PROFILE', updates);
    return this.formatCompany(updated);
  },

  // Format DynamoDB item to match Mongoose schema format
  formatCompany(item) {
    if (!item) return null;
    return {
      _id: item.companyId || item.PK,
      companyId: item.companyId || item.PK,
      name: item.name,
      email: item.email,
      image: item.image,
      password: item.password,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },
};
