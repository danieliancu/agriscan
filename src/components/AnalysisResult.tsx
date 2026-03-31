"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "motion/react";
import { Activity, AlertCircle, CheckCircle2, ExternalLink, Shield, ShoppingCart, Thermometer } from "lucide-react";
import type { CropAnalysis } from "@/src/lib/analysis";
import { cn } from "@/src/lib/utils";

interface AnalysisResultProps {
  analysis: CropAnalysis;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({ analysis }) => {
  const urgencyColors = {
    Low: "bg-blue-50 text-blue-700 border-blue-100",
    Moderate: "bg-amber-50 text-amber-700 border-amber-100",
    High: "bg-red-50 text-red-700 border-red-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto mt-12 space-y-8"
    >
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
                    return (
                      <motion.div
                        key={product.id}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-sage-100 transition-all duration-300 group"
                      >
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
