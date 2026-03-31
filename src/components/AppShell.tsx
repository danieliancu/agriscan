"use client";

import { useCallback, useState } from "react";
import { History, Leaf, ShieldCheck, Sprout, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { AnalysisResult } from "@/src/components/AnalysisResult";
import { ImageUpload } from "@/src/components/ImageUpload";
import type { CropAnalysis } from "@/src/lib/analysis";
import { analyzeCropImage } from "@/src/lib/client-analysis";

export function AppShell() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<CropAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = useCallback(async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = await analyzeCropImage(base64, mimeType);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-sage-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-sage-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sage-200">
                <Sprout size={24} />
              </div>
              <span className="text-xl font-serif font-bold text-sage-900 tracking-tight">PlantBuddy</span>
            </div>
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-sage-600">
              <a href="#" className="hover:text-sage-900 transition-colors">How it works</a>
              <a href="#" className="hover:text-sage-900 transition-colors">Common Diseases</a>
              <a href="#" className="hover:text-sage-900 transition-colors">About</a>
            </div>
            <button className="p-2 text-sage-600 hover:bg-sage-50 rounded-full transition-colors">
              <History size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow">
        <section className="relative overflow-hidden pt-16 pb-0 md:pb-24">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10 opacity-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-sage-300 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-sage-200 rounded-full blur-3xl" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-[2rem] sm:text-5xl md:text-7xl font-serif font-bold text-sage-950 leading-tight whitespace-nowrap">
                Protect Your Plants
              </h1>
              <p className="mt-6 text-lg md:text-xl text-sage-700 max-w-2xl mx-auto leading-relaxed">
                Identify crop diseases, pests, and deficiencies in seconds.
                Get expert treatment advice and safeguard your garden future.
              </p>
            </motion.div>

            <div className="mt-12">
              <ImageUpload
                onImageSelected={handleImageSelected}
                isAnalyzing={isAnalyzing}
                analysis={analysis}
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 max-w-md mx-auto"
              >
                {error}
              </motion.div>
            )}
          </div>
        </section>

        <AnimatePresence>
          {analysis && (
            <section id="analysis-report" className="pb-24 px-4 sm:px-6 lg:px-8 bg-sage-50/50">
              <AnalysisResult analysis={analysis} />
            </section>
          )}
        </AnimatePresence>

        {!analysis && !isAnalyzing && (
          <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center text-sage-600">
                    <Zap size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-sage-900">Instant Diagnosis</h3>
                  <p className="text-sage-600 leading-relaxed">
                    Our AI models are trained on millions of agricultural images to provide results in under 10 seconds.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center text-sage-600">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-sage-900">Expert Guidance</h3>
                  <p className="text-sage-600 leading-relaxed">
                    Receive detailed management strategies, including organic and sustainable treatment options.
                  </p>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-sage-100 rounded-2xl flex items-center justify-center text-sage-600">
                    <Leaf size={24} />
                  </div>
                  <h3 className="text-xl font-semibold text-sage-900">Wide Crop Support</h3>
                  <p className="text-sage-600 leading-relaxed">
                    From staple grains to exotic fruits, our system identifies issues across hundreds of plant species.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-sage-950 text-sage-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2">
              <Sprout size={24} className="text-sage-500" />
              <span className="text-xl font-serif font-bold text-white">PlantBuddy</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Support</a>
            </div>
            <p className="text-sm">&copy; 2026 AgriScan AI. Empowering farmers worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
