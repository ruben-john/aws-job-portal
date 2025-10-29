import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";
import fetch from "node-fetch";
import pdf from "pdf-parse";
import mammoth from "mammoth";

// Create a reusable Textract client
const textractClient = new TextractClient({
  region: process.env.AWS_REGION,
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

// Extract text from a Cloudinary URL using a pragmatic strategy:
// - Images: AWS Textract DetectDocumentText on bytes
// - PDF: pdf-parse fallback (Textract sync does not support multi-page PDFs via bytes)
// - DOCX: mammoth to extract text
export async function extractResumeTextFromUrl(fileUrl) {
  if (!fileUrl) return "";

  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch resume from URL. Status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());

  // DOCX
  if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") ||
      fileUrl.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").trim();
  }

  // PDF
  if (contentType.includes("application/pdf") || fileUrl.toLowerCase().endsWith(".pdf")) {
    const data = await pdf(buffer);
    return (data.text || "").trim();
  }

  // Images -> Textract
  if (contentType.startsWith("image/") || /(\.png|\.jpg|\.jpeg)$/i.test(fileUrl)) {
    const command = new DetectDocumentTextCommand({ Document: { Bytes: buffer } });
    const result = await textractClient.send(command);
    const lines = (result.Blocks || [])
      .filter(b => b.BlockType === "LINE")
      .map(b => b.Text)
      .filter(Boolean);
    return lines.join("\n");
  }

  // Fallback: return raw bytes as empty string if unsupported
  return "";
}



