import { CameraCapture } from '@/components/camera-capture';
import { AnalysisResults } from '@/components/analysis-results';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container max-w-2xl mx-auto p-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 drop-shadow-sm">
            Chef Vito
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto font-medium">
            Your AI-powered culinary assistant for dish analysis, fridge inventory, and recipe extraction
          </p>
        </div>

        {/* Camera */}
        <CameraCapture />

        {/* Results */}
        <AnalysisResults />
      </div>
    </main>
  );
}
