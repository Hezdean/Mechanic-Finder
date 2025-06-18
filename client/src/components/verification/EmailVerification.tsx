import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Mail, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function EmailVerification() {
  const [code, setCode] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendEmailMutation = useMutation({
    mutationFn: () => apiRequest('/api/verification/send-email', {
      method: 'POST'
    }),
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error sending email",
        description: error.message || "Failed to send verification email",
        variant: "destructive",
      });
    }
  });

  const verifyEmailMutation = useMutation({
    mutationFn: (code: string) => apiRequest('/api/verification/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim() })
    }),
    onSuccess: () => {
      setIsVerified(true);
      toast({
        title: "Email verified",
        description: "Your email has been successfully verified!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired verification code",
        variant: "destructive",
      });
    }
  });

  const handleSendEmail = () => {
    sendEmailMutation.mutate();
  };

  const handleVerifyEmail = () => {
    if (!code.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }
    verifyEmailMutation.mutate(code);
  };

  if (isVerified) {
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
          Verify your email address to enhance your account security and unlock all features.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Button 
            onClick={handleSendEmail}
            disabled={sendEmailMutation.isPending}
            className="w-full"
          >
            {sendEmailMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              'Send Verification Email'
            )}
          </Button>
        </div>

        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Enter verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <Button 
            onClick={handleVerifyEmail}
            disabled={verifyEmailMutation.isPending || !code.trim()}
            variant="outline"
            className="w-full"
          >
            {verifyEmailMutation.isPending ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Email'
            )}
          </Button>
        </div>

        {(sendEmailMutation.isError || verifyEmailMutation.isError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {sendEmailMutation.error?.message || verifyEmailMutation.error?.message || 
               "An error occurred. Please try again."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}