import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CheckCircle, Mail, RefreshCw } from "lucide-react";

export function EmailVerification() {
  const [verificationCode, setVerificationCode] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  const sendCodeMutation = useMutation({
    mutationFn: () => 
      apiRequest(`/api/verification/send-email`, "POST"),
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
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
      setVerificationCode("");
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
      apiRequest(`/api/verification/resend-email`, "POST", { userId: user?.id }),
    onSuccess: () => {
      toast({
        title: "New verification email sent",
        description: "A new verification code has been sent to your email.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive",
      });
    },
  });

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim()) {
      verifyCodeMutation.mutate(verificationCode);
    }
  };

  if (user?.emailVerified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Email Verified
          </CardTitle>
          <CardDescription>
            Your email address has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="default" className="bg-green-100 text-green-800">
            <Mail className="h-3 w-3 mr-1" />
            {user.email} - Verified
          </Badge>
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
          Verify your email address to enhance account security and receive important notifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Email: <strong>{user?.email}</strong>
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
            {verifyCodeMutation.isPending ? "Verifying..." : "Verify Email"}
          </Button>
        </form>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => sendCodeMutation.mutate()}
            disabled={sendCodeMutation.isPending}
            className="flex-1"
          >
            {sendCodeMutation.isPending ? "Sending..." : "Send Code"}
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
      </CardContent>
    </Card>
  );
}