import { create } from 'zustand';
import { AnalysisMode, AnalysisResult } from './types';

interface AppState {
  mode: AnalysisMode;
  currentImage: string | null;
  analysisResult: AnalysisResult | null;
  isAnalyzing: boolean;
  error: string | null;
  setMode: (mode: AnalysisMode) => void;
  setCurrentImage: (image: string | null) => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'dish',
  currentImage: null,
  analysisResult: null,
  isAnalyzing: false,
  error: null,
  setMode: (mode) => set({ mode, analysisResult: null, error: null }),
  setCurrentImage: (currentImage) => set({ currentImage }),
  setAnalysisResult: (analysisResult) => set({ analysisResult, isAnalyzing: false }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error, isAnalyzing: false }),
  reset: () => set({
    currentImage: null,
    analysisResult: null,
    isAnalyzing: false,
    error: null
  })
}));
