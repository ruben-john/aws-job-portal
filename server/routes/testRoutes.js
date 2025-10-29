import express from 'express';
import { db, TABLES } from '../config/db.js';

const router = express.Router();

// Test DynamoDB connectivity
router.get('/db', async (req, res) => {
  try {
    const { DynamoDBClient } = await import('@aws-sdk/client-dynamodb');
    const client = new DynamoDBClient({
      region: process.env.AWS_REGION || 'ap-south-1',
      credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      } : undefined,
    });

    // List tables to verify connection
    const { ListTablesCommand } = await import('@aws-sdk/client-dynamodb');
    const tablesResult = await client.send(new ListTablesCommand({}));
    
    res.json({
      success: true,
      message: 'DynamoDB connection successful',
      region: process.env.AWS_REGION || 'ap-south-1',
      tables: tablesResult.TableNames || [],
      configuredTables: TABLES,
      credentialsConfigured: !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'DynamoDB connection failed',
      error: error.message,
    });
  }
});

export default router;

