import { useAuth } from "@/hooks/use-auth";
import AIChatbot from "@/components/diagnostics/AIChatbot";

export default function DiagnosticsPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">AI Vehicle Diagnostics</h1>
          <p className="text-blue-200 mb-8">Please log in to access AI diagnostics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">AI Vehicle Diagnostics</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Describe your vehicle's symptoms and get instant AI-powered diagnostic suggestions.
          </p>
        </div>
        
        <AIChatbot />
      </div>
    </div>
  );
}