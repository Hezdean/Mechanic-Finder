import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Phone, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PhoneVerification() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendOtpMutation = useMutation({
    mutationFn: (phone: string) => apiRequest('/api/verification/send-phone', {
      method: 'POST',
      body: JSON.stringify({ phone })
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
        title: "Error sending OTP",
        description: error.message || "Failed to send OTP",
        variant: "destructive",
      });
    }
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (code: string) => apiRequest('/api/verification/verify-phone', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim() })
    }),
    onSuccess: () => {
      setIsVerified(true);
      toast({
        title: "Phone verified",
        description: "Your phone number has been successfully verified!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    },
    onError: (error: any) => {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid or expired OTP",
        variant: "destructive",
      });
    }
  });

  const handleSendOtp = () => {
    if (!phoneNumber.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter your phone number",
        variant: "destructive",
      });
      return;
    }
    sendOtpMutation.mutate(phoneNumber);
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter the OTP",
        variant: "destructive",
      });
      return;
    }
    verifyOtpMutation.mutate(otp);
  };

  if (isVerified) {
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
          Verify your phone number to receive important notifications and enhance security.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!otpSent ? (
          <div className="space-y-2">
            <Input
              type="tel"
              placeholder="Enter your phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <Button 
              onClick={handleSendOtp}
              disabled={sendOtpMutation.isPending}
              className="w-full"
            >
              {sendOtpMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Alert>
              <AlertDescription>
                OTP sent to {phoneNumber}. Please enter the code below.
              </AlertDescription>
            </Alert>
            <Input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyOtp}
                disabled={verifyOtpMutation.isPending || !otp.trim()}
                className="flex-1"
              >
                {verifyOtpMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button 
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                }}
                variant="outline"
              >
                Change Number
              </Button>
            </div>
          </div>
        )}

        {(sendOtpMutation.isError || verifyOtpMutation.isError) && (
          <Alert variant="destructive">
            <AlertDescription>
              {sendOtpMutation.error?.message || verifyOtpMutation.error?.message || 
               "An error occurred. Please try again."}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}