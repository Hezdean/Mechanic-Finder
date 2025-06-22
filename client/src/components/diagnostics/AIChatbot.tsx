import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Mic, 
  Camera, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Wrench,
  DollarSign
} from "lucide-react";

interface DiagnosticResponse {
  possibleCauses: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedActions: string[];
  estimatedCost: string;
  shouldSeeMechanic: boolean;
}

const urgencyColors = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  emergency: 'bg-red-100 text-red-800 border-red-200'
};

const urgencyIcons = {
  low: CheckCircle,
  medium: Clock,
  high: AlertTriangle,
  emergency: AlertTriangle
};

export default function AIChatbot() {
  const [symptoms, setSymptoms] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [diagnosis, setDiagnosis] = useState<DiagnosticResponse | null>(null);
  const { toast } = useToast();

  const diagnosticsMutation = useMutation({
    mutationFn: async (data: { symptoms: string; vehicle: string }) => {
      return apiRequest("/api/diagnostics", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      setDiagnosis(data);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get diagnostics. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!symptoms.trim() || !vehicle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both vehicle details and symptoms.",
        variant: "destructive",
      });
      return;
    }

    diagnosticsMutation.mutate({ symptoms, vehicle });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setIsRecording(true);
      
      // This is a simplified version - in production you'd implement full recording
      toast({
        title: "Recording Started",
        description: "Describe your vehicle's symptoms now...",
      });
      
      // Auto-stop after 30 seconds
      setTimeout(() => {
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
        toast({
          title: "Recording Stopped",
          description: "Processing your audio description...",
        });
      }, 30000);
    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Unable to access microphone. Please type your symptoms instead.",
        variant: "destructive",
      });
    }
  };

  const UrgencyIcon = diagnosis ? urgencyIcons[diagnosis.urgencyLevel] : Bot;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            AI Vehicle Diagnostics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Vehicle Information
              </label>
              <Input
                placeholder="e.g., 2018 Toyota Camry"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">
              Describe the Problem
            </label>
            <Textarea
              placeholder="Describe what's wrong with your vehicle... (e.g., strange noise when braking, engine won't start, etc.)"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={diagnosticsMutation.isPending || !symptoms.trim() || !vehicle.trim()}
              className="flex-1"
            >
              {diagnosticsMutation.isPending ? "Analyzing..." : "Get Diagnosis"}
            </Button>
            
            <Button
              variant="outline"
              onClick={startRecording}
              disabled={isRecording}
              className="flex items-center gap-2"
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-red-500' : ''}`} />
              {isRecording ? "Recording..." : "Record"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {diagnosis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UrgencyIcon className="h-6 w-6" />
              Diagnostic Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Urgency Level */}
            <div>
              <Badge className={urgencyColors[diagnosis.urgencyLevel]}>
                {diagnosis.urgencyLevel.toUpperCase()} Priority
              </Badge>
            </div>

            {/* Possible Causes */}
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Possible Causes
              </h4>
              <ul className="space-y-1">
                {diagnosis.possibleCauses.map((cause, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    {cause}
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommended Actions */}
            <div>
              <h4 className="font-semibold mb-2">Recommended Actions</h4>
              <ul className="space-y-1">
                {diagnosis.recommendedActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cost Estimate */}
            <div className="flex items-center gap-2 p-4 bg-neutral-50 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
              <div>
                <span className="font-medium">Estimated Cost: </span>
                <span className="text-green-600 font-semibold">{diagnosis.estimatedCost}</span>
              </div>
            </div>

            {/* Mechanic Recommendation */}
            {diagnosis.shouldSeeMechanic && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  We recommend consulting with a professional mechanic for this issue.
                  <Button variant="link" className="p-0 h-auto ml-2">
                    Find nearby mechanics
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}