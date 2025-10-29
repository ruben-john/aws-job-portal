# DynamoDB Migration Guide

This project has been migrated from MongoDB to AWS DynamoDB to take advantage of the AWS Free Tier.

## Database Schema

### Table Structures

**Users Table**
- PK: `userId` (Clerk user ID)
- SK: `PROFILE`
- Attributes: name, email, resume (URL), image, createdAt, updatedAt

**Companies Table**
- PK: `email`
- SK: `PROFILE`
- Attributes: companyId (generated), name, email, image, password, createdAt, updatedAt

**JobListings Table**
- PK: `companyId`
- SK: `jobId` (auto-generated)
- Attributes: title, description, location, category, level, salary, date, visible, createdAt, updatedAt

**Applications Table**
- PK: `jobId`
- SK: `userId#timestamp`
- Attributes: applicationId, userId, companyId, status, date, resumeText, rankingCache, createdAt, updatedAt

**ResumeAnalysis Table** (for future use)
- PK: `applicationId`
- SK: `RANKING`
- Attributes: analysis results from Gemini AI

## Setup Instructions

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Create DynamoDB Tables in AWS Console

Go to AWS DynamoDB Console (ap-south-1 region) and create the following tables:

#### Users Table
- Table name: `Users`
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Table settings: On-demand (Free Tier eligible)

#### Companies Table
- Table name: `Companies`
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Table settings: On-demand

#### JobListings Table
- Table name: `JobListings`
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Table settings: On-demand

#### Applications Table
- Table name: `Applications`
- Partition key: `PK` (String)
- Sort key: `SK` (String)
- Table settings: On-demand

### 3. Environment Variables

Create `server/.env` file with:

```env
# AWS DynamoDB Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Optional: Override table names
DYNAMO_TABLE_USERS=Users
DYNAMO_TABLE_JOBS=JobListings
DYNAMO_TABLE_APPLICATIONS=Applications
DYNAMO_TABLE_COMPANIES=Companies

# Gemini API (for AI features)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-flash-latest

# JWT Secret
JWT_SECRET=your_jwt_secret

# Cloudinary (unchanged)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

PORT=3005
```

### 4. Test Connection

Start the server and test:
```bash
npm run dev
```

Visit: `http://localhost:3005/test/db`

You should see a success response with table information.

## Key Differences from MongoDB

1. **No Auto-ID Generation**: IDs must be explicitly set or generated
2. **No Populate**: Related data must be fetched manually (see controllers)
3. **No Transactions**: Use batch operations where needed
4. **Query vs Scan**: Use Query for PK-based access, Scan sparingly
5. **No Schema Validation**: Validated at application level

## API Compatibility

All API endpoints remain the same. The frontend requires no changes.

## Cost Optimization (Free Tier)

- Use On-demand billing (included in Free Tier)
- Region: ap-south-1 (Mumbai)
- Free Tier includes 25 GB storage, 25 units of read/write capacity

## Migration Notes

- All Mongoose models replaced with DynamoDB helper functions
- Controllers updated to manually populate related data
- Caching mechanism preserved (rankingCache in Applications table)
- Resume analysis stored in applications, not separate table (can be moved later)

