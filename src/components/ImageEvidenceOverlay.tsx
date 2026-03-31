"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink, X } from "lucide-react";
import type { CropAnalysis } from "@/src/lib/analysis";
import { cn } from "@/src/lib/utils";

interface ImageEvidenceOverlayProps {
  analysis: CropAnalysis;
  imageUrl: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  showCloseButton?: boolean;
  onClear?: () => void;
}

export function ImageEvidenceOverlay({
  analysis,
  imageUrl,
  alt,
  className,
  imageClassName,
  showCloseButton = false,
  onClear,
}: ImageEvidenceOverlayProps) {
  const [hoveredSpotId, setHoveredSpotId] = useState<number | null>(null);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageFrame, setImageFrame] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
  });

  const getProductById = (id: string) => analysis.products.find((product) => product.id === id);
  const selectedSpot =
    selectedSpotId !== null ? analysis.issueSpots[selectedSpotId] ?? null : null;
  const selectedProduct = selectedSpot
    ? getProductById(selectedSpot.treatingProductId) ?? null
    : null;

  const updateImageFrame = useCallback(() => {
    if (!containerRef.current || !imageRef.current) {
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const naturalWidth = imageRef.current.naturalWidth;
    const naturalHeight = imageRef.current.naturalHeight;

    if (!naturalWidth || !naturalHeight) {
      return;
    }

    const scale = Math.min(
      containerRect.width / naturalWidth,
      containerRect.height / naturalHeight,
    );
    const renderedWidth = naturalWidth * scale;
    const renderedHeight = naturalHeight * scale;

    setImageFrame({
      left: (containerRect.width - renderedWidth) / 2,
      top: (containerRect.height - renderedHeight) / 2,
      width: renderedWidth,
      height: renderedHeight,
    });
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile);
    };
  }, []);

  useEffect(() => {
    updateImageFrame();

    const resizeObserver = new ResizeObserver(() => updateImageFrame());
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener("resize", updateImageFrame);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateImageFrame);
    };
  }, [imageUrl, updateImageFrame]);

  const renderProductCard = (
    spot: CropAnalysis["issueSpots"][number],
    product: CropAnalysis["products"][number],
    cardClassName?: string,
  ) => (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-sage-100 bg-white shadow-sm",
        cardClassName,
      )}
      onClick={(event) => event.stopPropagation()}
    >
      <div className="bg-sage-600 px-4 py-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          ISSUE: {spot.label}
        </p>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-sage-900">{product.name}</h4>
        <p className="mt-1 mb-3 text-xs leading-relaxed text-sage-600">
          {product.description}
        </p>
        <a
          href={product.amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-sage-700 transition-colors hover:text-sage-900"
        >
          Shop on Amazon
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );

  return (
    <>
      <div
        ref={containerRef}
        className={cn("relative rounded-3xl overflow-visible shadow-2xl bg-white", className)}
        onClick={() => {
          if (!isMobile) {
            setSelectedSpotId(null);
          }
        }}
      >
        <img
          ref={imageRef}
          src={imageUrl}
          alt={alt}
          className={cn("w-full h-auto max-h-[500px] object-cover rounded-3xl", imageClassName)}
          onLoad={updateImageFrame}
        />

        {showCloseButton && onClear && (
          <button
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            className="absolute top-4 right-4 z-30 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          >
            <X size={20} />
          </button>
        )}

        {analysis.issueSpots.map((spot, index) => {
          const isHovered = hoveredSpotId === index;
          const isSelected = selectedSpotId === index;
          const product = getProductById(spot.treatingProductId);
          const spotLeft = imageFrame.left + (spot.x / 1000) * imageFrame.width;
          const spotTop = imageFrame.top + (spot.y / 1000) * imageFrame.height;
          const spotWidth = (spot.width / 1000) * imageFrame.width;
          const spotHeight = (spot.height / 1000) * imageFrame.height;
          const placeOnLeft = spot.x + spot.width / 2 > 500;
          const cardLeft = placeOnLeft
            ? Math.max(spotLeft - 272, -120)
            : Math.min(spotLeft + spotWidth + 24, imageFrame.left + imageFrame.width + 24);
          const cardTop = Math.min(
            Math.max(spotTop - 10, 12),
            imageFrame.top + imageFrame.height - 120,
          );

          return (
            <React.Fragment key={`${spot.label}-${index}`}>
              <motion.button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedSpotId(index);
                }}
                onMouseEnter={() => setHoveredSpotId(index)}
                onMouseLeave={() => setHoveredSpotId(null)}
                className={cn(
                  "absolute z-20 cursor-pointer rounded-lg border-2 text-left transition-all duration-300",
                  isHovered || isSelected
                    ? "border-sage-500 bg-sage-500/20 scale-105"
                    : "border-red-500 bg-red-500/10",
                )}
                style={{
                  left: `${spotLeft}px`,
                  top: `${spotTop}px`,
                  width: `${spotWidth}px`,
                  height: `${spotHeight}px`,
                }}
              />

              <AnimatePresence>
                {!isMobile && isSelected && product && (
                  <motion.div
                    initial={{ opacity: 0, x: placeOnLeft ? 8 : -8, y: 8 }}
                    animate={{ opacity: 1, x: 0, y: 0 }}
                    exit={{ opacity: 0, x: placeOnLeft ? 8 : -8, y: 8 }}
                    className="absolute z-40 w-64 max-w-[calc(100%-1rem)]"
                    style={{
                      left: `${cardLeft}px`,
                      top: `${cardTop}px`,
                    }}
                  >
                    {renderProductCard(spot, product)}
                  </motion.div>
                )}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence>
        {isMobile && selectedSpot && selectedProduct && (
          <>
            <motion.button
              type="button"
              aria-label="Close shopping card"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-sage-950/35 backdrop-blur-[2px]"
              onClick={() => setSelectedSpotId(null)}
            />
            <motion.div
              initial={{ opacity: 0, x: "-50%", y: "calc(-50% + 12px)" }}
              animate={{ opacity: 1, x: "-50%", y: "-50%" }}
              exit={{ opacity: 0, x: "-50%", y: "calc(-50% + 12px)" }}
              className="fixed left-1/2 top-1/2 z-50"
            >
              {renderProductCard(
                selectedSpot,
                selectedProduct,
                "w-[min(20rem,calc(100vw-2rem))]",
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
