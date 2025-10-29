import pdf from "pdf-parse";
import mammoth from "mammoth";

export async function extractResumeTextFromUrl(fileUrl) {
  if (!fileUrl) return "";
  if (typeof fetch !== 'function') {
    throw new Error("Global fetch is not available in this Node version. Please use Node 18+ or install node-fetch.");
  }
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch resume. Status ${response.status}`);
  }
  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());

  if (contentType.includes("application/vnd.openxmlformats-officedocument.wordprocessingml.document") || fileUrl.toLowerCase().endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || "").trim();
  }

  if (contentType.includes("application/pdf") || fileUrl.toLowerCase().endsWith(".pdf")) {
    const data = await pdf(buffer);
    return (data.text || "").trim();
  }

  // No OCR in Gemini path; images will return empty
  return "";
}


