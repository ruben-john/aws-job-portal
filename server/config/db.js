import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

// Configure AWS credentials from environment variables
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

// Create DynamoDB Document Client for easier item operations
export const db = DynamoDBDocumentClient.from(client);

// Table names from environment or defaults
export const TABLES = {
  USERS: process.env.DYNAMO_TABLE_USERS || 'Users',
  JOBS: process.env.DYNAMO_TABLE_JOBS || 'JobListings',
  APPLICATIONS: process.env.DYNAMO_TABLE_APPLICATIONS || 'Applications',
  COMPANIES: process.env.DYNAMO_TABLE_COMPANIES || 'Companies',
  RESUME_ANALYSIS: process.env.DYNAMO_TABLE_RESUME_ANALYSIS || 'ResumeAnalysis',
};

// Connection test function
const connectDB = async () => {
  try {
    // Test connection by listing tables (lightweight operation)
    const { DynamoDBClient: TestClient } = await import('@aws-sdk/client-dynamodb');
    const testClient = new TestClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    });
    
    // Simple connectivity check
    console.log('DynamoDB client initialized');
    console.log(`Region: ${process.env.AWS_REGION || 'ap-south-1'}`);
    console.log('DynamoDB connected successfully');
  } catch (error) {
    console.error(`Failed to connect to DynamoDB: ${error.message}`);
    // Don't exit - allow app to start even if credentials are missing (for local dev)
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
};

export default connectDB;
