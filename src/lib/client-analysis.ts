import type { CropAnalysis } from "@/src/lib/analysis";

export async function analyzeCropImage(
  base64Image: string,
  mimeType: string,
): Promise<CropAnalysis> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ base64Image, mimeType }),
  });

  const payload = (await response.json()) as CropAnalysis | { error?: string };

  if (!response.ok) {
    const errorMessage =
      "error" in payload && typeof payload.error === "string"
        ? payload.error
        : "Failed to analyze image. Please try again.";
    throw new Error(errorMessage);
  }

  return payload as CropAnalysis;
}
