import { CameraCapture } from '@/components/camera-capture';
import { AnalysisResults } from '@/components/analysis-results';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container max-w-2xl mx-auto p-4 py-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-green-600 mb-2">
            Chef Vito
          </h1>
          <p className="text-muted-foreground">
            AI-powered culinary assistant
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
