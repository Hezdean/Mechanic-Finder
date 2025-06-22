import { useAuth } from "@/hooks/use-auth";
import AIChatbot from "@/components/diagnostics/AIChatbot";

export default function DiagnosticsPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">AI Vehicle Diagnostics</h1>
        <p className="text-neutral-600 mb-8">Please log in to access AI diagnostics.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">AI Vehicle Diagnostics</h1>
        <p className="mt-2 text-neutral-600">
          Describe your vehicle's symptoms and get instant AI-powered diagnostic suggestions.
        </p>
      </div>
      
      <AIChatbot />
    </div>
  );
}