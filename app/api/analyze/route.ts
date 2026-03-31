import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";
import type { CropAnalysis } from "@/src/lib/analysis";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 500 },
    );
  }

  const { base64Image, mimeType } = (await request.json()) as {
    base64Image?: string;
    mimeType?: string;
  };

  if (!base64Image || !mimeType) {
    return NextResponse.json(
      { error: "Image payload is missing." },
      { status: 400 },
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    You are an expert plant pathologist and agricultural consultant.
    Analyze the provided image of a crop or plant leaf.

    1. Identify the plant species.
    2. Identify any visible diseases, pests, or nutrient deficiencies.
    3. For each identified issue (spots, lesions, pests, etc.), provide normalized bounding box coordinates [ymin, xmin, ymax, xmax] in the range [0, 1000].
    4. Suggest specific care products to treat these issues. Assign a unique ID (e.g., "p1", "p2") to each product.
    5. For each identified issue spot, specify which product ID is the primary treatment for it.
    6. Return a structured JSON report.

    If the image is not of a plant or is too blurry, return an error message in the plantSpecies field.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image.split(",")[1],
      mimeType,
    },
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            plantSpecies: { type: Type.STRING },
            diagnosis: { type: Type.STRING },
            confidence: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            causes: { type: Type.ARRAY, items: { type: Type.STRING } },
            treatment: {
              type: Type.OBJECT,
              properties: {
                immediate: { type: Type.ARRAY, items: { type: Type.STRING } },
                prevention: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ["immediate", "prevention"],
            },
            products: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  amazonLink: { type: Type.STRING },
                },
                required: ["id", "name", "description", "amazonLink"],
              },
            },
            urgency: { type: Type.STRING, enum: ["Low", "Moderate", "High"] },
            detailedReport: { type: Type.STRING },
            issueSpots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  x: { type: Type.NUMBER },
                  y: { type: Type.NUMBER },
                  width: { type: Type.NUMBER },
                  height: { type: Type.NUMBER },
                  treatingProductId: { type: Type.STRING },
                },
                required: ["label", "x", "y", "width", "height", "treatingProductId"],
              },
            },
          },
          required: [
            "plantSpecies",
            "diagnosis",
            "confidence",
            "symptoms",
            "causes",
            "treatment",
            "products",
            "urgency",
            "detailedReport",
            "issueSpots",
          ],
        },
      },
    });

    return NextResponse.json(JSON.parse(response.text) as CropAnalysis);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze image. Please try again." },
      { status: 500 },
    );
  }
}
