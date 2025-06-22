import { useAuth } from "@/hooks/use-auth";
import AIChatbot from "@/components/diagnostics/AIChatbot";

export default function DiagnosticsPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-foreground">AI Vehicle Diagnostics</h1>
          <p className="text-muted-foreground mb-8">Please log in to access AI diagnostics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">AI Vehicle Diagnostics</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Describe your vehicle's symptoms and get instant AI-powered diagnostic suggestions.
          </p>
        </div>
        
        <AIChatbot />
      </div>
    </div>
  );
}