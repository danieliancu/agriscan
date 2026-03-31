"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "motion/react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Shield,
  ShoppingCart,
  Thermometer,
} from "lucide-react";
import type { CropAnalysis } from "@/src/lib/analysis";
import { cn } from "@/src/lib/utils";

interface AnalysisResultProps {
  analysis: CropAnalysis;
  imageUrl: string;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis, imageUrl }) => {
  const [hoveredSpotId, setHoveredSpotId] = useState<number | null>(null);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
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

  const urgencyColors = {
    Low: "bg-blue-50 text-blue-700 border-blue-100",
    Moderate: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-red-50 text-red-700 border-red-100",
  };

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
    className?: string,
    style?: React.CSSProperties,
  ) => (
    <div
      className={cn(
        "z-40 overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 group",
        "border-sage-100",
        className,
      )}
      onClick={(event) => event.stopPropagation()}
      style={style}
    >
      <div className="bg-sage-600 px-4 py-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">
          ISSUE: {spot.label}
        </p>
      </div>
      <div className="p-4">
        <h4 className="font-semibold text-sage-900 text-sm flex items-center justify-between">
          {product.name}
        </h4>
        <p className="text-xs text-sage-600 mt-1 mb-3 leading-relaxed">
          {product.description}
        </p>
        <a
          href={product.amazonLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-sage-700 hover:text-sage-900 transition-colors"
        >
          Shop on Amazon
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto mt-12 space-y-8"
    >
      <div className="bg-white rounded-3xl shadow-xl border border-sage-100">
        <div className="bg-sage-900 p-4 px-6 flex items-center justify-between">
          <h3 className="text-white font-serif font-medium flex items-center gap-2">
            <ImageIcon size={18} className="text-sage-400" />
            Visual Evidence &amp; Solutions
          </h3>
          <span className="text-xs text-sage-400 font-mono">Hover spots to see treatments</span>
        </div>
        <div
          ref={containerRef}
          className="relative aspect-video md:aspect-auto md:h-[500px] bg-sage-50 flex items-center justify-center overflow-visible px-6 md:px-20 py-6"
          onClick={() => {
            if (!isMobile) {
              setSelectedSpotId(null);
            }
          }}
        >
          <div className="absolute inset-0 overflow-hidden rounded-b-3xl">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Analyzed Crop"
              className="w-full h-full object-contain"
              onLoad={updateImageFrame}
            />
          </div>

          {analysis.issueSpots.map((spot, index) => {
            const isHovered =
              hoveredSpotId === index || hoveredProductId === spot.treatingProductId;
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
              <React.Fragment key={index}>
                <motion.button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedSpotId(index);
                  }}
                  onMouseEnter={() => setHoveredSpotId(index)}
                  onMouseLeave={() => setHoveredSpotId(null)}
                  className={cn(
                    "absolute border-2 rounded-lg transition-all duration-300 cursor-pointer text-left",
                    isHovered || isSelected
                      ? "border-sage-500 bg-sage-500/20 z-20 scale-105"
                      : "border-red-500 bg-red-500/10 z-10",
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
              className="fixed inset-0 z-40 bg-sage-950/35 backdrop-blur-[2px] md:hidden"
              onClick={() => setSelectedSpotId(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              className="fixed left-1/2 top-1/2 z-50 md:hidden"
              style={{ transform: "translate(-50%, -50%)" }}
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

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-sage-100">
        <div className="bg-sage-900 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle2 className="text-sage-400" />
            <div>
              <h2 className="text-xl font-serif font-medium">Health Diagnosis</h2>
              <p className="text-xs text-sage-400 font-mono uppercase tracking-widest">
                {analysis.plantSpecies}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "px-4 py-1.5 rounded-full text-xs font-semibold border",
                urgencyColors[analysis.urgency],
              )}
            >
              Urgency: {analysis.urgency}
            </div>
            <div className="px-3 py-1 bg-sage-800 rounded-full text-xs text-sage-300 font-mono uppercase tracking-wider">
              Confidence: {analysis.confidence}
            </div>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h3 className="text-2xl font-serif font-bold text-sage-900 mb-4 flex items-center gap-2">
                  <Activity size={24} className="text-sage-600" />
                  Diagnosis: {analysis.diagnosis}
                </h3>
                <div className="markdown-body">
                  <ReactMarkdown>{analysis.detailedReport}</ReactMarkdown>
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-sage-50 rounded-2xl border border-sage-100">
                  <h4 className="font-semibold text-sage-900 mb-3 flex items-center gap-2">
                    <Shield size={18} className="text-sage-600" />
                    Immediate Actions
                  </h4>
                  <ul className="space-y-2">
                    {analysis.treatment.immediate.map((item, index) => (
                      <li key={index} className="text-sm text-sage-700 flex gap-2">
                        <span className="text-sage-400">&bull;</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-6 bg-sage-50 rounded-2xl border border-sage-100">
                  <h4 className="font-semibold text-sage-900 mb-3 flex items-center gap-2">
                    <Thermometer size={18} className="text-sage-600" />
                    Prevention
                  </h4>
                  <ul className="space-y-2">
                    {analysis.treatment.prevention.map((item, index) => (
                      <li key={index} className="text-sm text-sage-700 flex gap-2">
                        <span className="text-sage-400">&bull;</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-sage-50 rounded-3xl p-6 border border-sage-100">
                <h3 className="text-lg font-serif font-bold text-sage-900 mb-4 flex items-center gap-2">
                  <ShoppingCart size={20} className="text-sage-600" />
                  Recommended Care
                </h3>
                <div className="space-y-4">
                  {analysis.products.map((product) => {
                    const isLinked = analysis.issueSpots.some(
                      (spot) =>
                        spot.treatingProductId === product.id &&
                        hoveredSpotId !== null &&
                        analysis.issueSpots[hoveredSpotId]?.treatingProductId === product.id,
                    );

                    return (
                      <motion.div
                        key={product.id}
                        onMouseEnter={() => setHoveredProductId(product.id)}
                        onMouseLeave={() => setHoveredProductId(null)}
                        className={cn(
                          "bg-white p-4 rounded-2xl shadow-sm border transition-all duration-300 group",
                          isLinked || hoveredProductId === product.id
                            ? "border-sage-500 ring-2 ring-sage-100 scale-[1.02]"
                            : "border-sage-100",
                        )}
                      >
                        <h4 className="font-semibold text-sage-900 text-sm flex items-center justify-between">
                          {product.name}
                          {isLinked && (
                            <span className="text-[10px] bg-sage-100 text-sage-600 px-2 py-0.5 rounded-full">
                              Targeted
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-sage-600 mt-1 mb-3 leading-relaxed">
                          {product.description}
                        </p>
                        <a
                          href={product.amazonLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-xs font-bold text-sage-700 hover:text-sage-900 transition-colors"
                        >
                          Shop on Amazon
                          <ExternalLink size={12} />
                        </a>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
                <div className="flex gap-3 mb-2">
                  <AlertCircle className="text-amber-600 shrink-0" size={18} />
                  <h4 className="text-sm font-bold text-amber-900">Expert Advice</h4>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This analysis is a preliminary guide. For critical decisions, consult a certified
                  agronomist.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
