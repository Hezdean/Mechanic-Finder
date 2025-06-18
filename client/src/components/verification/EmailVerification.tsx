import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Mail } from "lucide-react";

export function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendCodeMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/verification/send-email`, "POST"),
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email.",
        variant: "destructive",
      });
    },
  });

  const verifyCodeMutation = useMutation({
    mutationFn: (code: string) => 
      apiRequest(`/api/verification/verify-email`, "POST", { code }),
    onSuccess: () => {
      toast({
        title: "Email verified successfully",
        description: "Your email has been verified.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
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
      apiRequest(`/api/verification/resend-email`, "POST", { userId: user?.id }),
    onSuccess: () => {
      toast({
        title: "New verification email sent",
        description: "A new verification code has been sent to your email.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      });
    },
  });

  if (user?.emailVerified) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Email verified</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Verification
        </CardTitle>
        <CardDescription>
          Verify your email address to secure your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => sendCodeMutation.mutate()}
            disabled={sendCodeMutation.isPending}
          >
            {sendCodeMutation.isPending ? "Sending..." : "Send Verification Code"}
          </Button>
          <Button 
            variant="outline"
            onClick={() => resendCodeMutation.mutate()}
            disabled={resendCodeMutation.isPending}
          >
            {resendCodeMutation.isPending ? "Resending..." : "Resend Code"}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Input
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
          <Button 
            onClick={() => verifyCodeMutation.mutate(verificationCode)}
            disabled={verifyCodeMutation.isPending || !verificationCode.trim()}
            className="w-full"
          >
            {verifyCodeMutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}