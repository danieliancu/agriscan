"use client";

import React, { useRef, useState } from "react";
import { ArrowDown, Camera, ExternalLink, Image as ImageIcon, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { ImageEvidenceOverlay } from "@/src/components/ImageEvidenceOverlay";
import type { CropAnalysis } from "@/src/lib/analysis";
import { cn } from "@/src/lib/utils";

const MAX_IMAGE_DIMENSION = 1000;
const IMAGE_QUALITY = 0.82;

interface ImageUploadProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
  analysis?: CropAnalysis | null;
}

function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read image data."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image for optimization."));
    image.src = src;
  });
}

async function optimizeImage(file: File): Promise<{ base64: string; mimeType: string }> {
  const objectUrl = URL.createObjectURL(file);

  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
    const targetWidth = Math.max(1, Math.round(image.width * scale));
    const targetHeight = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Canvas is not available.");
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const targetMimeType = file.type === "image/png" ? "image/png" : "image/webp";
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (generatedBlob) => resolve(generatedBlob),
        targetMimeType,
        IMAGE_QUALITY,
      );
    });

    if (!blob) {
      throw new Error("Failed to compress image.");
    }

    return {
      base64: await readFileAsDataUrl(blob),
      mimeType: blob.type || targetMimeType,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageSelected,
  isAnalyzing,
  analysis,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);

    try {
      const { base64, mimeType } = await optimizeImage(file);
      setPreview(base64);
      onImageSelected(base64, mimeType);
    } catch {
      const base64 = await readFileAsDataUrl(file);
      setPreview(base64);
      onImageSelected(base64, file.type);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void processFile(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const urgencyColors = {
    Low: "bg-blue-50 text-blue-700 border-blue-100",
    Moderate: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <div className={cn("w-full", analysis && "max-w-7xl mx-auto")}>
      <AnimatePresence mode="wait">
        {!preview ? (
          <div className="w-full max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "relative group cursor-pointer",
                "border-2 border-dashed border-sage-300 rounded-3xl p-12",
                "bg-white/50 backdrop-blur-sm transition-all duration-300",
                "hover:border-sage-500 hover:bg-sage-100/50",
                (isAnalyzing || isProcessing) && "pointer-events-none opacity-50",
              )}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-sage-100 flex items-center justify-center text-sage-600 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-sage-900">Upload Crop Photo</h3>
                  <p className="text-sage-600 mt-1">Drag and drop or click to browse</p>
                  <p className="text-sm text-sage-500 mt-2">
                    Images are resized locally to max 1000px before upload.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-4">
                  <div className="flex items-center gap-2 text-sm text-sage-500">
                    <Camera size={16} />
                    <span>Take Photo</span>
                  </div>
                  <div className="w-1 h-1 rounded-full bg-sage-300" />
                  <div className="flex items-center gap-2 text-sm text-sage-500">
                    <ImageIcon size={16} />
                    <span>Gallery</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {analysis ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)_240px] lg:items-start xl:grid-cols-[280px_minmax(0,1fr)_280px]">
                <aside className="hidden lg:block">
                  <div className="sticky top-24 rounded-3xl border border-sage-100 bg-white/90 p-6 text-left shadow-xl backdrop-blur-sm">
                    <p className="text-xs font-mono uppercase tracking-[0.24em] text-sage-500">
                      Health Diagnosis
                    </p>
                    <h3 className="mt-3 text-2xl font-serif font-bold text-sage-950">
                      {analysis.plantSpecies}
                    </h3>
                    <div className="mt-6 space-y-3">
                      <div
                        className={cn(
                          "w-full inline-flex rounded-full border px-4 py-1.5 text-xs font-semibold",
                          urgencyColors[analysis.urgency],
                        )}
                      >
                        Urgency: {analysis.urgency}
                      </div>
                      <div className="block rounded-full bg-sage-100 px-4 py-1.5 text-xs font-semibold text-sage-700">
                        Confidence: {analysis.confidence}
                      </div>
                    </div>
                    <a
                      href="#analysis-report"
                      className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-sage-700 transition-colors hover:text-sage-900"
                    >
                      View full report
                      <ArrowDown size={16} />
                    </a>
                  </div>
                </aside>

                <div className="w-full max-w-2xl mx-auto">
                  <ImageEvidenceOverlay
                    analysis={analysis}
                    imageUrl={preview}
                    alt="Preview"
                    showCloseButton={!isAnalyzing}
                    onClear={clearImage}
                  />
                </div>

                <aside className="hidden lg:block">
                  <div className="sticky top-24 space-y-4 text-left">
                    {analysis.products.map((product) => (
                      <div
                        key={product.id}
                        className="rounded-3xl border border-sage-100 bg-white/90 p-5 shadow-xl backdrop-blur-sm"
                      >
                        <h4 className="mt-3 text-base font-semibold text-sage-900">
                          {product.name}
                        </h4>
                        <p className="mt-2 text-sm leading-relaxed text-sage-600">
                          {product.description}
                        </p>
                        <a
                          href={product.amazonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sage-700 transition-colors hover:text-sage-900"
                        >
                          Shop on Amazon
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    ))}
                  </div>
                </aside>
              </div>
            ) : (
              <div className="w-full max-w-2xl mx-auto">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-white">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-auto max-h-[500px] object-cover"
                  />

                  {!isAnalyzing && (
                    <button
                      onClick={clearImage}
                      className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  )}

                  {(isAnalyzing || isProcessing) && (
                    <div className="absolute inset-0 bg-sage-900/40 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <p className="text-white font-medium tracking-wide">
                          {isProcessing ? "Optimizing image..." : "Analyzing Plant Health..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
