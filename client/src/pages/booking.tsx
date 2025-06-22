import { useAuth } from "@/hooks/use-auth";
import InstantBooking from "@/components/booking/InstantBooking";

export default function BookingPage() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Instant Booking</h1>
        <p className="text-neutral-600 mb-8">Please log in to book appointments.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Instant Booking & Scheduling</h1>
        <p className="mt-2 text-neutral-600">
          Book appointments with nearby mechanics in real-time.
        </p>
      </div>
      
      <InstantBooking />
    </div>
  );
}