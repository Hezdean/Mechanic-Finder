import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Phone, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PhoneVerificationProps {
  onSuccess?: () => void;
  isVerified?: boolean;
  phoneNumber?: string;
}

export function PhoneVerification({ onSuccess, isVerified = false, phoneNumber }: PhoneVerificationProps) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: () => apiRequest("/api/verification/send-phone", {
      method: "POST",
    }),
    onSuccess: () => {
      setOtpSent(true);
      toast({
        title: "OTP sent",
        description: "Please check your phone for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send OTP",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (code: string) => apiRequest("/api/verification/verify-phone", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
    onSuccess: () => {
      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP.",
        variant: "destructive",
      });
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () => apiRequest("/api/verification/resend", {
      method: "POST",
      body: JSON.stringify({ type: "phone" }),
    }),
    onSuccess: () => {
      toast({
        title: "OTP resent",
        description: "A new OTP has been sent to your phone.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend OTP",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSendOtp = () => {
    sendOtpMutation.mutate();
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast({
        title: "OTP required",
        description: "Please enter the OTP code.",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate(otp);
  };

  const handleResendOtp = () => {
    resendOtpMutation.mutate();
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Phone Verified</CardTitle>
          <CardDescription>
            Your phone number has been successfully verified.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!phoneNumber) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Phone className="h-12 w-12 text-gray-400" />
          </div>
          <CardTitle className="text-gray-700">No Phone Number</CardTitle>
          <CardDescription>
            Please add a phone number to your profile to enable phone verification.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Phone className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle>Verify Your Phone</CardTitle>
        <CardDescription>
          {otpSent 
            ? `Enter the OTP sent to ${phoneNumber}`
            : `Click below to send an OTP to ${phoneNumber}`
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!otpSent ? (
          <Button 
            onClick={handleSendOtp}
            disabled={sendOtpMutation.isPending}
            className="w-full"
          >
            {sendOtpMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp-code">OTP Code</Label>
              <Input
                id="otp-code"
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button 
              onClick={handleVerifyOtp}
              disabled={verifyOtpMutation.isPending}
              className="w-full"
            >
              {verifyOtpMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Phone"
              )}
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResendOtp}
                disabled={resendOtpMutation.isPending}
                className="text-sm"
              >
                {resendOtpMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend OTP"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}