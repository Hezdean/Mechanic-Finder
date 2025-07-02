import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ArrivalVerificationProps {
  jobId: number;
  onVerificationSuccess?: () => void;
}

const ArrivalVerification = ({ jobId, onVerificationSuccess }: ArrivalVerificationProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const { toast } = useToast();

  const handleVerifyArrival = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast({
        title: "Code Required",
        description: "Please enter the verification code provided by the mechanic.",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch(`/api/jobs/${jobId}/verify-arrival`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          code: verificationCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setVerificationStatus('success');
        toast({
          title: "Arrival Confirmed",
          description: "Mechanic arrival has been successfully verified!",
        });
        onVerificationSuccess?.();
      } else {
        setVerificationStatus('error');
        toast({
          title: "Verification Failed",
          description: data.message || "Invalid verification code. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Verification error:", error);
      setVerificationStatus('error');
      toast({
        title: "Verification Error",
        description: "Failed to verify arrival. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const resetVerification = () => {
    setVerificationCode("");
    setVerificationStatus('pending');
  };

  if (verificationStatus === 'success') {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-green-800">Arrival Confirmed</CardTitle>
          <CardDescription>
            The mechanic's arrival has been successfully verified. Work can now begin on your vehicle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            onClick={resetVerification}
            className="w-full"
          >
            Verify Another Arrival
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <CardTitle>Verify Mechanic Arrival</CardTitle>
        <CardDescription>
          Enter the verification code provided by your mechanic to confirm their arrival at your location.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerifyArrival} className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
              Verification Code *
            </label>
            <Input
              id="verificationCode"
              type="text"
              placeholder="Enter 6-character code (e.g., ABC123)"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              className="w-full text-center font-mono text-lg"
              maxLength={6}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Ask your mechanic for the arrival verification code
            </p>
          </div>

          <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              Only verify arrival when the mechanic is physically present at your location for security.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isVerifying || !verificationCode.trim()}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Verify Arrival
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-muted-foreground">
            Having trouble? Contact support or ask the mechanic to generate a new code.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArrivalVerification;