import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Phone, RefreshCw } from "lucide-react";

export function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const { user } = useAuth();
  const { toast } = useToast();

  const sendCodeMutation = useMutation({
    mutationFn: (phone: string) => 
      apiRequest(`/api/verification/send-phone`, "POST", { phone }),
    onSuccess: () => {
      toast({
        title: "Verification code sent",
        description: "Please check your phone for the verification code.",
      });
      setStep("code");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: (code: string) => 
      apiRequest(`/api/verification/verify-phone`, "POST", { code }),
    onSuccess: () => {
      toast({
        title: "Phone verified successfully",
        description: "Your phone number has been verified.",
      });
      setVerificationCode("");
      setStep("phone");
    },
    onError: () => {
      toast({
        title: "Verification failed",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resendCodeMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/verification/resend-phone`, "POST", { userId: user?.id }),
    onSuccess: () => {
      toast({
        title: "New verification code sent",
        description: "A new verification code has been sent to your phone.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resend verification code.",
        variant: "destructive",
      });
    },
  });

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.trim()) {
      sendCodeMutation.mutate(phoneNumber);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim()) {
      verifyCodeMutation.mutate(verificationCode);
    }
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
            Your phone number has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Phone className="h-3 w-3 mr-1" />
            {user.phone} - Verified
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Verification
        </CardTitle>
        <CardDescription>
          Verify your phone number to enhance account security and receive SMS notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "phone" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div>
              <Input
                type="tel"
                placeholder="Enter your phone number (e.g., +1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            <Button 
              type="submit" 
              disabled={sendCodeMutation.isPending || !phoneNumber.trim()}
              className="w-full"
            >
              {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
        ) : (
          <>
            <Alert>
              <AlertDescription>
                Code sent to: <strong>{phoneNumber}</strong>
              </AlertDescription>
            </Alert>

            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
              </div>
              <Button 
                type="submit" 
                disabled={verifyCodeMutation.isPending || !verificationCode.trim()}
                className="w-full"
              >
                {verifyCodeMutation.isPending ? "Verifying..." : "Verify Phone"}
              </Button>
            </form>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setStep("phone")}
                className="flex-1"
              >
                Change Number
              </Button>
              <Button
                variant="outline"
                onClick={() => resendCodeMutation.mutate()}
                disabled={resendCodeMutation.isPending}
                className="flex-1"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${resendCodeMutation.isPending ? 'animate-spin' : ''}`} />
                {resendCodeMutation.isPending ? "Resending..." : "Resend"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}