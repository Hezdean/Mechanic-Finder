import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Car, 
  Wrench, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign, 
  Clock,
  Zap,
  Shield,
  AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

interface DiagnosticResponse {
  possibleCauses: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  recommendedActions: string[];
  estimatedCost: string;
  shouldSeeMechanic: boolean;
}

const urgencyConfig = {
  low: {
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle,
    label: "Low Priority"
  },
  medium: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    icon: Clock,
    label: "Medium Priority"
  },
  high: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: AlertTriangle,
    label: "High Priority"
  },
  emergency: {
    color: "bg-red-100 text-red-800 border-red-200",
    icon: AlertCircle,
    label: "Emergency"
  }
};

export default function DiagnosticsPage() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [symptoms, setSymptoms] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [context, setContext] = useState("");
  const [diagnosticResult, setDiagnosticResult] = useState<DiagnosticResponse | null>(null);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const diagnosticMutation = useMutation({
    mutationFn: async (data: { symptoms: string; vehicle: string; context?: string }) => {
      const response = await apiRequest('/api/diagnostics', {
        method: 'POST',
        body: JSON.stringify(data)
      });
      return await response.json();
    },
    onSuccess: (result) => {
      console.log('Diagnostic API Response:', result);
      console.log('Possible Causes:', result?.possibleCauses);
      console.log('Estimated Cost:', result?.estimatedCost);
      setDiagnosticResult(result);
    },
    onError: (error: any) => {
      toast({
        title: "Diagnostic Error",
        description: error.message || "Failed to analyze symptoms. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!symptoms.trim() || !vehicle.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide both vehicle information and symptoms.",
        variant: "destructive",
      });
      return;
    }

    diagnosticMutation.mutate({
      symptoms: symptoms.trim(),
      vehicle: vehicle.trim(),
      context: context.trim() || undefined
    });
  };

  const handleFindMechanic = () => {
    window.location.href = "/mechanics";
  };

  const urgency = diagnosticResult ? urgencyConfig[diagnosticResult.urgencyLevel] : null;
  const UrgencyIcon = urgency?.icon;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Zap className="h-8 w-8 text-blue-600" />
          AI Vehicle Diagnostics
        </h1>
        <p className="text-gray-600 mt-2">
          Get instant analysis of your vehicle issues using advanced AI technology
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Input Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
              <CardDescription>
                Tell us about your vehicle and the issues you're experiencing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle Details</Label>
                <Input
                  id="vehicle"
                  placeholder="e.g., 2018 Honda Civic, Toyota Camry 2020"
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="symptoms">Symptoms & Issues</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Describe what's happening with your vehicle. Be as detailed as possible - unusual sounds, smells, performance issues, warning lights, etc."
                  rows={4}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="context">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="Any additional information - when the issue started, driving conditions, recent maintenance, etc."
                  rows={3}
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                />
              </div>

              <Button 
                onClick={handleAnalyze}
                disabled={diagnosticMutation.isPending || !symptoms.trim() || !vehicle.trim()}
                className="w-full"
              >
                {diagnosticMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Wrench className="h-4 w-4 mr-2" />
                    Analyze Issue
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {diagnosticResult && (
            <>
              {/* Urgency Level */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {UrgencyIcon && <UrgencyIcon className="h-5 w-5" />}
                    Priority Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge className={`text-sm px-3 py-1 ${urgency?.color}`}>
                    {urgency?.label}
                  </Badge>
                  {diagnosticResult.urgencyLevel === 'emergency' && (
                    <Alert className="mt-4 border-red-200 bg-red-50">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <AlertDescription className="text-red-700">
                        This appears to be an emergency situation. Please stop driving and seek immediate assistance.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* Possible Causes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Possible Causes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnosticResult.possibleCauses?.map((cause, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{cause}</span>
                      </li>
                    )) || <li className="text-gray-500">No causes identified</li>}
                  </ul>
                </CardContent>
              </Card>

              {/* Recommended Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Recommended Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {diagnosticResult.recommendedActions?.map((action, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{action}</span>
                      </li>
                    )) || <li className="text-gray-500">No recommendations available</li>}
                  </ul>
                </CardContent>
              </Card>

              {/* Cost Estimate */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Estimated Cost
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold text-gray-900">
                    {diagnosticResult.estimatedCost}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    This is an estimate based on common repair costs. Actual costs may vary.
                  </p>
                </CardContent>
              </Card>

              {/* Professional Recommendation */}
              {diagnosticResult.shouldSeeMechanic && (
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-blue-900">
                      <Shield className="h-5 w-5" />
                      Professional Service Recommended
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-blue-800 mb-4">
                      Based on the analysis, we recommend having this issue diagnosed by a professional mechanic.
                    </p>
                    <Button onClick={handleFindMechanic} className="w-full">
                      <Wrench className="h-4 w-4 mr-2" />
                      Find Nearby Mechanics
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!diagnosticResult && (
            <Card className="border-dashed">
              <CardContent className="text-center py-12">
                <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Enter your vehicle information and symptoms to get an AI-powered diagnostic analysis
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}