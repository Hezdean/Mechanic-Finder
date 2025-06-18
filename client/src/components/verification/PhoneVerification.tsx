import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Phone } from "lucide-react";

export function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code.",
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
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      setStep("phone");
      setPhoneNumber("");
      setVerificationCode("");
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid verification code.",
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification code.",
        variant: "destructive",
      });
    },
  });

  if (user?.phoneVerified) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Phone verified</span>
          </div>
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
          Verify your phone number for enhanced security
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "phone" ? (
          <div className="space-y-2">
            <Input
              placeholder="Enter phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Button 
              onClick={() => sendCodeMutation.mutate(phoneNumber)}
              disabled={sendCodeMutation.isPending || !phoneNumber.trim()}
              className="w-full"
            >
              {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              placeholder="Enter verification code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            <div className="flex gap-2">
              <Button 
                onClick={() => verifyCodeMutation.mutate(verificationCode)}
                disabled={verifyCodeMutation.isPending || !verificationCode.trim()}
                className="flex-1"
              >
                {verifyCodeMutation.isPending ? "Verifying..." : "Verify Phone"}
              </Button>
              <Button 
                variant="outline"
                onClick={() => resendCodeMutation.mutate()}
                disabled={resendCodeMutation.isPending}
              >
                {resendCodeMutation.isPending ? "Resending..." : "Resend"}
              </Button>
            </div>
            <Button 
              variant="ghost"
              onClick={() => setStep("phone")}
              className="w-full"
            >
              Change Phone Number
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}