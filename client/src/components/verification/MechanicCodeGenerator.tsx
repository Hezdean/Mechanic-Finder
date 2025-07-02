import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RefreshCw, MapPin, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MechanicCodeGeneratorProps {
  jobId: number;
  customerName?: string;
}

const MechanicCodeGenerator = ({ jobId, customerName }: MechanicCodeGeneratorProps) => {
  const [arrivalCode, setArrivalCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateArrivalCode = async () => {
    setIsGenerating(true);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/generate-arrival-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setArrivalCode(data.code);
        toast({
          title: "Code Generated",
          description: "Share this code with the customer to verify your arrival.",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: data.message || "Failed to generate arrival code.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Code generation error:", error);
      toast({
        title: "Generation Error",
        description: "Failed to generate arrival code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCodeToClipboard = async () => {
    if (!arrivalCode) return;
    
    try {
      await navigator.clipboard.writeText(arrivalCode);
      toast({
        title: "Code Copied",
        description: "Arrival code copied to clipboard.",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy code. Please copy manually: " + arrivalCode,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <MapPin className="h-6 w-6 text-green-600" />
        </div>
        <CardTitle>Arrival Verification</CardTitle>
        <CardDescription>
          Generate a code to share with {customerName || 'the customer'} when you arrive at their location.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!arrivalCode ? (
          <Button
            onClick={generateArrivalCode}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Generate Arrival Code
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-primary/10 border-2 border-primary rounded-lg p-6">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Your Arrival Code
                </p>
                <p className="text-3xl font-mono font-bold text-primary tracking-wider">
                  {arrivalCode}
                </p>
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={copyCodeToClipboard}
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Code
              </Button>
              <Button
                variant="outline"
                onClick={generateArrivalCode}
                disabled={isGenerating}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Share this code with the customer to verify your arrival.
              </p>
              <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border">
                Only share this code when you are physically at the customer's location.
              </p>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <h4 className="font-semibold text-sm mb-2">Instructions:</h4>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Generate your arrival code before heading to the customer</li>
            <li>2. When you arrive, share the code with the customer</li>
            <li>3. Customer enters the code in their app to confirm your arrival</li>
            <li>4. Once verified, you can begin work safely</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};

export default MechanicCodeGenerator;