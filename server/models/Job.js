import { getItem, putItem, updateItem, queryItems, scanItems } from './dynamoHelpers.js';
import { TABLES } from '../config/db.js';
import crypto from 'crypto';

/**
 * Job Model - DynamoDB implementation
 * PK: companyId
 * SK: jobId (generated)
 * Attributes: title, description, location, category, level, salary, date, visible, createdAt, updatedAt
 */

// Generate jobId
function generateJobId() {
  return crypto.randomBytes(12).toString('hex');
}

export default {
  // Find job by ID
  async findById(jobId) {
    // Need to scan since jobId is SK, not PK
    const items = await scanItems(TABLES.JOBS, {
      filter: '#SK = :jobId',
      values: { ':jobId': jobId },
      names: { '#SK': 'SK' },
    });
    return items.length > 0 ? this.formatJob(items[0]) : null;
  },

  // Find jobs by company
  async find(filters) {
    if (filters.companyId) {
      const items = await queryItems(TABLES.JOBS, filters.companyId);
      return items.map(item => this.formatJob(item));
    }
    if (filters.visible !== undefined) {
      // Scan for visible jobs
      const items = await scanItems(TABLES.JOBS, {
        filter: '#visible = :visible',
        values: { ':visible': filters.visible },
        names: { '#visible': 'visible' },
      });
      return items.map(item => this.formatJob(item));
    }
    // Get all jobs
    const items = await scanItems(TABLES.JOBS);
    return items.map(item => this.formatJob(item));
  },

  // Create new job
  async create(jobData) {
    const jobId = generateJobId();
    const item = {
      PK: jobData.companyId.toString(),
      SK: jobId,
      jobId,
      title: jobData.title,
      description: jobData.description || '',
      location: jobData.location,
      category: jobData.category,
      level: jobData.level,
      salary: jobData.salary,
      date: jobData.date || Date.now(),
      visible: jobData.visible !== undefined ? jobData.visible : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await putItem(TABLES.JOBS, item);
    return this.formatJob(item);
  },

  // Save/Update job
  async save() {
    // This method is called on an instance, so we need the data
    // In practice, controllers should use findByIdAndUpdate
    throw new Error('Use findByIdAndUpdate instead');
  },

  // Update job
  async findByIdAndUpdate(jobId, updates) {
    // Find the job first to get PK
    const job = await this.findById(jobId);
    if (!job) return null;
    
    const updated = await updateItem(TABLES.JOBS, job.companyId, jobId, updates);
    return this.formatJob(updated);
  },

  // Format DynamoDB item to match Mongoose schema format
  formatJob(item) {
    if (!item) return null;
    return {
      _id: item.jobId || item.SK,
      jobId: item.jobId || item.SK,
      title: item.title,
      description: item.description,
      location: item.location,
      category: item.category,
      level: item.level,
      salary: item.salary,
      date: item.date,
      visible: item.visible !== undefined ? item.visible : true,
      companyId: item.PK,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  },
};
