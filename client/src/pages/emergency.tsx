import { useAuth } from "@/hooks/use-auth";
import EmergencyButton from "@/components/emergency/EmergencyButton";

export default function EmergencyPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Emergency Assistance</h1>
        <p className="text-neutral-600 mb-8">Please log in to access emergency services.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Emergency Assistance</h1>
        <p className="mt-2 text-neutral-600">
          Get immediate help for vehicle breakdowns and emergencies.
        </p>
      </div>
      
      <div className="max-w-md mx-auto">
        <EmergencyButton />
      </div>
    </div>
  );
}