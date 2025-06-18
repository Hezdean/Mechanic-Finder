import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface EmailVerificationProps {
  onSuccess?: () => void;
  isVerified?: boolean;
}

export function EmailVerification({ onSuccess, isVerified = false }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendEmailMutation = useMutation({
    mutationFn: () => apiRequest("/api/verification/send-email", {
      method: "POST",
    }),
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (code: string) => apiRequest("/api/verification/verify-email", {
      method: "POST",
      body: JSON.stringify({ code }),
    }),
    onSuccess: () => {
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired code.",
        variant: "destructive",
      });
    },
  });

  const resendEmailMutation = useMutation({
    mutationFn: () => apiRequest("/api/verification/resend", {
      method: "POST",
      body: JSON.stringify({ type: "email" }),
    }),
    onSuccess: () => {
      toast({
        title: "Email resent",
        description: "A new verification email has been sent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to resend email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSendEmail = () => {
    sendEmailMutation.mutate();
  };

  const handleVerifyEmail = () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Code required",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    verifyEmailMutation.mutate(verificationCode);
  };

  const handleResendEmail = () => {
    resendEmailMutation.mutate();
  };

  if (isVerified) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-green-700">Email Verified</CardTitle>
          <CardDescription>
            Your email address has been successfully verified.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Mail className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle>Verify Your Email</CardTitle>
        <CardDescription>
          {emailSent 
            ? "Enter the verification code sent to your email"
            : "Click below to send a verification code to your email"
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!emailSent ? (
          <Button 
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
            className="w-full"
          >
            {sendEmailMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Verification Email"
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div>
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            </div>
            
            <Button 
              onClick={handleVerifyEmail}
              disabled={verifyEmailMutation.isPending}
              className="w-full"
            >
              {verifyEmailMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Email"
              )}
            </Button>
            
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={handleResendEmail}
                disabled={resendEmailMutation.isPending}
                className="text-sm"
              >
                {resendEmailMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resending...
                  </>
                ) : (
                  "Resend Email"
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}