import { getItem, putItem, updateItem, queryItems, scanItems } from './dynamoHelpers.js';
import { TABLES } from '../config/db.js';
import crypto from 'crypto';

/**
 * JobApplication Model - DynamoDB implementation
 * PK: jobId
 * SK: userId#timestamp (for uniqueness)
 * Attributes: companyId, status, date, resumeText, rankingCache, createdAt, updatedAt
 */

export default {
  // Find application by ID (applicationId is the combination)
  async findById(applicationId) {
    // applicationId format: jobId#userId#timestamp
    const parts = applicationId.split('#');
    if (parts.length >= 2) {
      const item = await getItem(TABLES.APPLICATIONS, parts[0], applicationId.substring(parts[0].length + 1));
      return item ? this.formatApplication(item) : null;
    }
    return null;
  },

  // Find applications by jobId
  async find(filters) {
    if (filters.jobId && filters.userId) {
      // Fetch all applications for this jobId
      const items = await queryItems(TABLES.APPLICATIONS, filters.jobId);
      // AND filter: Only keep those from this user
      return items.filter(x => x.userId === filters.userId).map(item => this.formatApplication(item));
    }
    if (filters.jobId) {
      const items = await queryItems(TABLES.APPLICATIONS, filters.jobId);
      return items.map(item => this.formatApplication(item));
    }
    if (filters.userId) {
      // Scan for userId (since it's in SK)
      const items = await scanItems(TABLES.APPLICATIONS, {
        filter: 'contains(SK, :userId)',
        values: { ':userId': filters.userId },
      });
      return items.map(item => this.formatApplication(item));
    }
    if (filters.companyId) {
      const items = await scanItems(TABLES.APPLICATIONS, {
        filter: 'companyId = :companyId',
        values: { ':companyId': filters.companyId },
      });
      return items.map(item => this.formatApplication(item));
    }
    return [];
  },

  // Create new application
  async create(applicationData) {
    const timestamp = applicationData.date || Date.now();
    const sk = `${applicationData.userId}#${timestamp}`;
    const applicationId = `${applicationData.jobId}#${sk}`;
    
    const item = {
      PK: applicationData.jobId.toString(),
      SK: sk,
      applicationId,
      userId: applicationData.userId,
      jobId: applicationData.jobId.toString(),
      companyId: applicationData.companyId.toString(),
      status: applicationData.status || 'Pending',
      date: timestamp,
      resumeText: applicationData.resumeText || '',
      rankingCache: applicationData.rankingCache || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putItem(TABLES.APPLICATIONS, item);
    return this.formatApplication(item);
  },

  // Update application
  async findByIdAndUpdate(applicationId, updates) {
    const parts = applicationId.split('#');
    if (parts.length >= 2) {
      const updated = await updateItem(TABLES.APPLICATIONS, parts[0], applicationId.substring(parts[0].length + 1), updates);
      return this.formatApplication(updated);
    }
    return null;
  },

  // Find one application (used in controllers)
  async findOne(filters) {
    if (filters._id) {
      return this.findById(filters._id);
    }
    if (filters.jobId && filters.userId) {
      const items = await queryItems(TABLES.APPLICATIONS, filters.jobId);
      const found = items.find(item => item.userId === filters.userId);
      return found ? this.formatApplication(found) : null;
    }
    return null;
  },

  // Format DynamoDB item to match Mongoose schema format
  formatApplication(item) {
    if (!item) return null;
    return {
      _id: item.applicationId || `${item.PK}#${item.SK}`,
      applicationId: item.applicationId || `${item.PK}#${item.SK}`,
      userId: item.userId,
      jobId: item.jobId || item.PK,
      companyId: item.companyId,
      status: item.status || 'Pending',
      date: item.date,
      resumeText: item.resumeText || '',
      rankingCache: item.rankingCache || {},
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },
};
