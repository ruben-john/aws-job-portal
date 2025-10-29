import { db, TABLES } from '../config/db.js';
import { GetCommand, PutCommand, QueryCommand, ScanCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';

/**
 * Generic helper functions for DynamoDB CRUD operations
 */

// Get a single item by PK and SK
export async function getItem(tableName, pk, sk = null) {
  try {
    const params = {
      TableName: tableName,
      Key: sk ? { PK: pk, SK: sk } : { PK: pk },
    };
    const result = await db.send(new GetCommand(params));
    return result.Item || null;
  } catch (error) {
    console.error(`Error getting item from ${tableName}:`, error);
    throw error;
  }
}

// Put/Create an item
export async function putItem(tableName, item) {
  try {
    const params = {
      TableName: tableName,
      Item: {
        ...item,
        updatedAt: new Date().toISOString(),
        createdAt: item.createdAt || new Date().toISOString(),
      },
    };
    await db.send(new PutCommand(params));
    return params.Item;
  } catch (error) {
    console.error(`Error putting item to ${tableName}:`, error);
    throw error;
  }
}

// Update an item (partial update)
export async function updateItem(tableName, pk, sk, updates) {
  try {
    const updateExpr = [];
    const exprAttrNames = {};
    const exprAttrValues = {};
    
    Object.keys(updates).forEach((key, index) => {
      updateExpr.push(`#attr${index} = :val${index}`);
      exprAttrNames[`#attr${index}`] = key;
      exprAttrValues[`:val${index}`] = updates[key];
    });
    
    updateExpr.push(`updatedAt = :now`);
    exprAttrValues[`:now`] = new Date().toISOString();
    
    const params = {
      TableName: tableName,
      Key: sk ? { PK: pk, SK: sk } : { PK: pk },
      UpdateExpression: `SET ${updateExpr.join(', ')}`,
      ExpressionAttributeNames: exprAttrNames,
      ExpressionAttributeValues: exprAttrValues,
      ReturnValues: 'ALL_NEW',
    };
    
    const result = await db.send(new UpdateCommand(params));
    return result.Attributes;
  } catch (error) {
    console.error(`Error updating item in ${tableName}:`, error);
    throw error;
  }
}

// Delete an item
export async function deleteItem(tableName, pk, sk = null) {
  try {
    const params = {
      TableName: tableName,
      Key: sk ? { PK: pk, SK: sk } : { PK: pk },
    };
    await db.send(new DeleteCommand(params));
    return true;
  } catch (error) {
    console.error(`Error deleting item from ${tableName}:`, error);
    throw error;
  }
}

// Query items by PK (and optional SK begins_with)
export async function queryItems(tableName, pk, skBeginsWith = null, filterExpr = null) {
  try {
    const params = {
      TableName: tableName,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: { ':pk': pk },
    };
    
    if (skBeginsWith) {
      params.KeyConditionExpression += ' AND begins_with(SK, :sk)';
      params.ExpressionAttributeValues[':sk'] = skBeginsWith;
    }
    
    if (filterExpr) {
      params.FilterExpression = filterExpr.filter;
      Object.assign(params.ExpressionAttributeValues, filterExpr.values || {});
      if (filterExpr.names) {
        params.ExpressionAttributeNames = filterExpr.names;
      }
    }
    
    const result = await db.send(new QueryCommand(params));
    return result.Items || [];
  } catch (error) {
    console.error(`Error querying items from ${tableName}:`, error);
    throw error;
  }
}

// Scan entire table (use sparingly, query is preferred)
export async function scanItems(tableName, filterExpr = null, limit = null) {
  try {
    const params = { TableName: tableName };
    
    if (filterExpr) {
      params.FilterExpression = filterExpr.filter;
      params.ExpressionAttributeValues = filterExpr.values || {};
      if (filterExpr.names) {
        params.ExpressionAttributeNames = filterExpr.names;
      }
    }
    
    if (limit) {
      params.Limit = limit;
    }
    
    const result = await db.send(new ScanCommand(params));
    return result.Items || [];
  } catch (error) {
    console.error(`Error scanning items from ${tableName}:`, error);
    throw error;
  }
}

// Batch operations helpers
export async function batchGetItems(tableName, keys) {
  // For batch operations, you'd use BatchGetCommand
  // Simplified version here - implement full batch if needed
  const items = [];
  for (const key of keys) {
    const item = await getItem(tableName, key.PK, key.SK);
    if (item) items.push(item);
  }
  return items;
}

