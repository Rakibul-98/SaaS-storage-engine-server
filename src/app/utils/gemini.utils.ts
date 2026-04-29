import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";

const genAI = new GoogleGenerativeAI(config.gemini_api_key);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Auto-generate tags for a file based on its name, MIME type, and optional text content.
 * Returns an array of 3–6 concise lowercase tags.
 */
export const generateFileTags = async (
  fileName: string,
  mimeType: string,
  textContent?: string,
): Promise<string[]> => {
  try {
    const prompt = `You are a file categorization assistant. Given a file's metadata, generate 3-6 concise, relevant tags (lowercase, single words or short phrases).

File name: ${fileName}
MIME type: ${mimeType}
${textContent ? `Content preview: ${textContent.slice(0, 500)}` : ""}

Respond ONLY with a JSON array of strings. Example: ["invoice", "finance", "2024", "pdf"]
Do not include any explanation or markdown.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    const cleaned = text.replace(/```json|```/g, "").trim();
    const tags = JSON.parse(cleaned);

    if (Array.isArray(tags)) {
      return tags.slice(0, 6).map((t: string) => String(t).toLowerCase());
    }
    return [];
  } catch (err) {
    console.error("Gemini tag generation failed:", err);
    return [];
  }
};

/**
 * Generate a 2-3 sentence plain-language summary of a document's text content.
 */
export const generateDocumentSummary = async (
  fileName: string,
  textContent: string,
): Promise<string | null> => {
  try {
    if (!textContent || textContent.trim().length < 50) return null;

    const prompt = `Summarize the following document content in 2-3 clear, concise sentences. Focus on the key information. Do not include any preamble.

File name: ${fileName}
Content:
${textContent.slice(0, 3000)}`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("Gemini summarization failed:", err);
    return null;
  }
};

/**
 * Generate an image description for search indexing.
 */
export const generateImageDescription = async (
  fileName: string,
  imageBase64: string,
  mimeType: string,
): Promise<string[]> => {
  try {
    const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Describe this image and generate 4-6 relevant search tags as a JSON array of lowercase strings.
File name: ${fileName}
Respond ONLY with a JSON array. Example: ["cat", "outdoor", "sunny", "pet", "animal"]`;

    const result = await visionModel.generateContent([
      prompt,
      {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    ]);

    const text = result.response.text().trim();
    const cleaned = text.replace(/```json|```/g, "").trim();
    const tags = JSON.parse(cleaned);

    if (Array.isArray(tags)) {
      return tags.slice(0, 8).map((t: string) => String(t).toLowerCase());
    }
    return [];
  } catch (err) {
    console.error("Gemini image analysis failed:", err);
    return [];
  }
};
