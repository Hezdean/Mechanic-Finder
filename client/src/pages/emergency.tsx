import { useAuth } from "@/hooks/use-auth";
import EmergencyButton from "@/components/emergency/EmergencyButton";

export default function EmergencyPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Emergency Assistance</h1>
          <p className="text-blue-200 mb-8">Please log in to access emergency services.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Emergency Assistance</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Get immediate help for vehicle breakdowns and emergencies.
          </p>
        </div>
        
        <div className="max-w-md mx-auto">
          <EmergencyButton />
        </div>
      </div>
    </div>
  );
}