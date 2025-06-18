import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function PhoneVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendOTP = async () => {
    if (!user?.phone) {
      toast({
        title: "No phone number",
        description: "Please add a phone number to your profile first.",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    try {
      await apiRequest('/api/verification/send-phone', {
        method: 'POST'
      });
      toast({
        title: "OTP sent",
        description: "Please check your phone for the verification code."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP",
        variant: "destructive"
      });
    }
    setIsSending(false);
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      toast({
        title: "Error",
        description: "Please enter the OTP",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/verification/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ code: otp.trim() })
      });
      toast({
        title: "Phone verified successfully",
        description: "Your phone number has been verified."
      });
      window.location.reload(); // Refresh to update user state
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  if (user?.phoneVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Phone Verified
          </CardTitle>
          <CardDescription>
            Your phone number {user.phone} is verified.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!user?.phone) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Verification
          </CardTitle>
          <CardDescription>
            Add a phone number to your profile to enable phone verification.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Verify Phone Number
        </CardTitle>
        <CardDescription>
          Verify your phone number {user.phone} to complete your account setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={handleSendOTP} 
            disabled={isSending}
            className="w-full"
          >
            {isSending ? "Sending..." : "Send OTP"}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="otp">OTP Code</Label>
          <Input
            id="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
          />
        </div>
        
        <Button 
          onClick={handleVerifyOTP} 
          disabled={isLoading || !otp.trim()}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify Phone"}
        </Button>
      </CardContent>
    </Card>
  );
}