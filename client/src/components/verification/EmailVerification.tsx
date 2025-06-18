import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export function EmailVerification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleSendVerification = async () => {
    setIsSending(true);
    try {
      await apiRequest('/api/verification/send-email', {
        method: 'POST'
      });
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification email",
        variant: "destructive"
      });
    }
    setIsSending(false);
  };

  const handleVerifyCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter the verification code",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      await apiRequest('/api/verification/verify-email', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim() })
      });
      toast({
        title: "Email verified successfully",
        description: "Your email address has been verified."
      });
      window.location.reload(); // Refresh to update user state
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive"
      });
    }
    setIsLoading(false);
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
            Your email address {user.email} is verified.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Verify Email Address
        </CardTitle>
        <CardDescription>
          Verify your email address {user?.email} to complete your account setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={handleSendVerification} 
            disabled={isSending}
            className="w-full"
          >
            {isSending ? "Sending..." : "Send Verification Email"}
          </Button>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
        </div>
        
        <Button 
          onClick={handleVerifyCode} 
          disabled={isLoading || !code.trim()}
          className="w-full"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>
      </CardContent>
    </Card>
  );
}