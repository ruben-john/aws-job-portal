import AWS from "aws-sdk";

AWS.config.update({
  region: process.env.AWS_REGION1 || "eu-north-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID1,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY1,
});

// ✅ Create both clients with region set
const s3 = new AWS.S3({ region: process.env.AWS_REGION1 || "eu-north-1" });
const ses = new AWS.SES({ apiVersion: "2010-12-01", region: process.env.AWS_REGION1 || "eu-north-1" });

export{s3,ses};