"use client";

import React, { useRef, useState } from "react";
import { Camera, Image as ImageIcon, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";

const MAX_IMAGE_DIMENSION = 1000;
const IMAGE_QUALITY = 0.82;

interface ImageUploadProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isAnalyzing: boolean;
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

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageSelected, isAnalyzing }) => {
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

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        {!preview ? (
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
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-3xl overflow-hidden shadow-2xl bg-white"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
