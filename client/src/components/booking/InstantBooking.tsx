import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Star,
  User,
  CheckCircle,
  Wrench
} from "lucide-react";
import { format, addHours, startOfToday } from "date-fns";

interface Mechanic {
  id: number;
  firstName: string;
  lastName: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  isAvailable: boolean;
  currentLatitude: number;
  currentLongitude: number;
  specializations: string[];
  distance?: number;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

export default function InstantBooking() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [duration, setDuration] = useState<string>("60");
  const [notes, setNotes] = useState("");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Get user location on component mount
  useState(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  });

  const { data: nearbyMechanics = [], isLoading } = useQuery({
    queryKey: ['/api/mechanics/nearby'],
    enabled: !!userLocation,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      return apiRequest("/api/bookings", {
        method: "POST",
        body: JSON.stringify(bookingData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Booking Confirmed",
        description: "Your appointment has been scheduled successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      // Reset form
      setSelectedMechanic(null);
      setSelectedTime("");
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Booking Failed",
        description: "Unable to schedule appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleBooking = () => {
    if (!selectedMechanic || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a mechanic and time slot.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(':').map(Number);
    scheduledDateTime.setHours(hours, minutes, 0, 0);

    bookingMutation.mutate({
      mechanicId: selectedMechanic.id,
      scheduledDateTime: scheduledDateTime.toISOString(),
      duration: parseInt(duration),
      notes,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-primary" />
            Instant Booking & Scheduling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Date & Time Selection */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Select Date</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date < startOfToday()}
                  className="rounded-md border"
                />
              </div>

              <div>
                <h3 className="font-semibold mb-2">Duration</h3>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Additional Notes</h3>
                <Textarea
                  placeholder="Describe the service needed or any special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="space-y-4">
              <h3 className="font-semibold">Available Time Slots</h3>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                    className="text-xs"
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Mechanics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Available Mechanics Nearby
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-neutral-600">Finding nearby mechanics...</p>
            </div>
          ) : nearbyMechanics.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600">No mechanics available in your area.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyMechanics.map((mechanic: Mechanic) => (
                <Card
                  key={mechanic.id}
                  className={`cursor-pointer transition-all ${
                    selectedMechanic?.id === mechanic.id
                      ? "ring-2 ring-primary border-primary"
                      : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedMechanic(mechanic)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {mechanic.firstName[0]}{mechanic.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold truncate">
                              {mechanic.firstName} {mechanic.lastName}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs">
                                {mechanic.rating || 0} ({mechanic.reviewCount || 0})
                              </span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <Badge
                              variant={mechanic.isAvailable ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {mechanic.isAvailable ? "Available" : "Busy"}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center gap-1 text-xs text-neutral-600">
                            <MapPin className="h-3 w-3" />
                            <span>{mechanic.distance ? `${mechanic.distance}km away` : 'Location available'}</span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-neutral-600">
                            <Clock className="h-3 w-3" />
                            <span>${mechanic.hourlyRate || 0}/hour</span>
                          </div>
                        </div>

                        {mechanic.specializations && mechanic.specializations.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {mechanic.specializations.slice(0, 2).map((spec) => (
                              <Badge key={spec} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {mechanic.specializations.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{mechanic.specializations.length - 2} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Book Now Button */}
      {selectedMechanic && selectedTime && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-semibold">
                    Booking with {selectedMechanic.firstName} {selectedMechanic.lastName}
                  </p>
                  <p className="text-sm text-neutral-600">
                    {format(selectedDate, 'MMM dd, yyyy')} at {selectedTime} ({duration} minutes)
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleBooking}
                disabled={bookingMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {bookingMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}