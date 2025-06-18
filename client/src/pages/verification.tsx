import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { EmailVerification } from "@/components/verification/EmailVerification";
import { PhoneVerification } from "@/components/verification/PhoneVerification";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle2, AlertCircle } from "lucide-react";

export default function VerificationPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Helmet>
          <title>Verification - Mechanic Finder</title>
        </Helmet>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">Please log in to access verification settings.</p>
          </div>
        </div>
      </>
    );
  }

  const emailVerified = user.emailVerified;
  const phoneVerified = user.phoneVerified;
  const allVerified = emailVerified && phoneVerified;

  return (
    <>
      <Helmet>
        <title>Account Verification - Mechanic Finder</title>
        <meta name="description" content="Verify your email and phone number to secure your Mechanic Finder account and build trust with other users." />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Verification</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Verify your email and phone number to enhance security and build trust with other users on the platform.
            </p>
          </div>

          {/* Verification Status Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Verification Status
                {allVerified && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {!allVerified && <AlertCircle className="h-5 w-5 text-amber-600" />}
              </CardTitle>
              <CardDescription>
                Your current verification status for enhanced security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Email Verification</h3>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <Badge variant={emailVerified ? "default" : "secondary"}>
                    {emailVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Phone Verification</h3>
                    <p className="text-sm text-gray-600">
                      {user.phone || "No phone number"}
                    </p>
                  </div>
                  <Badge variant={phoneVerified ? "default" : "secondary"}>
                    {phoneVerified ? "Verified" : "Pending"}
                  </Badge>
                </div>
              </div>
              
              {allVerified && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Account Fully Verified
                    </span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Great! Your account is fully verified and trusted on the platform.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Verification Tabs */}
          <Tabs defaultValue="email" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="email" className="flex items-center gap-2">
                Email
                {emailVerified && <CheckCircle2 className="h-4 w-4" />}
              </TabsTrigger>
              <TabsTrigger value="phone" className="flex items-center gap-2">
                Phone
                {phoneVerified && <CheckCircle2 className="h-4 w-4" />}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="email" className="flex justify-center mt-6">
              <EmailVerification 
                isVerified={emailVerified}
                onSuccess={() => window.location.reload()}
              />
            </TabsContent>
            
            <TabsContent value="phone" className="flex justify-center mt-6">
              <PhoneVerification 
                isVerified={phoneVerified}
                phoneNumber={user.phone}
                onSuccess={() => window.location.reload()}
              />
            </TabsContent>
          </Tabs>

          {/* Trust Benefits */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Benefits of Verification</CardTitle>
              <CardDescription>
                Why verifying your account enhances your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-medium mb-2">Enhanced Security</h3>
                  <p className="text-sm text-gray-600">
                    Protect your account with verified contact information
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="font-medium mb-2">Build Trust</h3>
                  <p className="text-sm text-gray-600">
                    Verified accounts are more trusted by other users
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <AlertCircle className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-medium mb-2">Important Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Receive alerts about your jobs and transactions
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}