import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Clock,
  CheckCircle 
} from "lucide-react";

interface EmergencyRequest {
  latitude: number;
  longitude: number;
  description: string;
  vehicle: string;
}

export default function EmergencyButton() {
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const emergencyMutation = useMutation({
    mutationFn: async (data: EmergencyRequest) => {
      return apiRequest("/api/emergency", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setIsEmergencyActive(true);
      toast({
        title: "Emergency Request Sent",
        description: "Nearby mechanics have been notified. Help is on the way!",
      });
    },
    onError: () => {
      toast({
        title: "Emergency Request Failed",
        description: "Please try again or call emergency services.",
        variant: "destructive",
      });
    },
  });

  const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ lat: latitude, lng: longitude });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  };

  const handleEmergency = async () => {
    try {
      const userLocation = await getCurrentLocation();
      setLocation(userLocation);

      emergencyMutation.mutate({
        latitude: userLocation.lat,
        longitude: userLocation.lng,
        description: "Emergency breakdown assistance needed",
        vehicle: "Emergency situation", // This could be pre-filled from user profile
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your location. Please enable GPS and try again.",
        variant: "destructive",
      });
    }
  };

  if (isEmergencyActive) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <CheckCircle className="h-6 w-6" />
            Emergency Request Active
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Badge variant="destructive" className="bg-red-600">
            EMERGENCY ACTIVE
          </Badge>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-red-600" />
              <span>Location shared with nearby mechanics</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-red-600" />
              <span>Average response time: 15-30 minutes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-red-600" />
              <span>You will be contacted shortly</span>
            </div>
          </div>

          {location && (
            <div className="mt-4 p-3 bg-white rounded border">
              <p className="text-xs text-neutral-600 mb-1">Your Location:</p>
              <p className="text-sm font-mono">
                {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                onClick={() => {
                  const mapsUrl = `https://maps.google.com/?q=${location.lat},${location.lng}`;
                  window.open(mapsUrl, '_blank');
                }}
              >
                View on Maps
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsEmergencyActive(false)}
          >
            Cancel Emergency Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-6 w-6" />
          Emergency Assistance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-neutral-600">
          In case of vehicle breakdown or emergency, tap the button below to immediately 
          alert nearby mechanics with your GPS location.
        </p>

        <div className="space-y-2 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            <span>GPS location will be shared</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-3 w-3" />
            <span>Mechanics will contact you directly</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>Priority emergency response</span>
          </div>
        </div>

        <Button
          className="w-full bg-red-600 hover:bg-red-700 text-white"
          size="lg"
          onClick={handleEmergency}
          disabled={emergencyMutation.isPending}
        >
          <AlertTriangle className="h-5 w-5 mr-2" />
          {emergencyMutation.isPending ? "Sending SOS..." : "EMERGENCY SOS"}
        </Button>

        <p className="text-xs text-center text-neutral-500">
          For life-threatening emergencies, call 911 immediately
        </p>
      </CardContent>
    </Card>
  );
}