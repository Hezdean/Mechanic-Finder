import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ArrivalVerification from "@/components/verification/ArrivalVerification";
import MechanicCodeGenerator from "@/components/verification/MechanicCodeGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Users, MapPin } from "lucide-react";

const VerificationPage = () => {
  const { user } = useAuth();
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [jobIdInput, setJobIdInput] = useState("");

  const handleSetJobId = () => {
    const jobId = parseInt(jobIdInput);
    if (jobId && jobId > 0) {
      setSelectedJobId(jobId);
    }
  };

  const isMechanic = user?.role === "mechanic" || user?.role === "admin";
  const isCustomer = user?.role === "car_owner" || user?.role === "admin";

  return (
    <>
      <Helmet>
        <title>Arrival Verification - Mechanic Finder</title>
        <meta name="description" content="Verify mechanic arrivals and generate arrival codes for secure service verification." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Arrival Verification</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Secure verification system to confirm mechanic arrivals and ensure safe service delivery.
            </p>
          </div>

          {/* Job ID Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Select Job
              </CardTitle>
              <CardDescription>
                Enter the job ID to access verification tools for that specific service request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Enter Job ID (e.g., 123)"
                  value={jobIdInput}
                  onChange={(e) => setJobIdInput(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleSetJobId} disabled={!jobIdInput.trim()}>
                  Select Job
                </Button>
              </div>
              {selectedJobId && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Job #{selectedJobId} selected
                </p>
              )}
            </CardContent>
          </Card>

          {selectedJobId && (
            <Tabs defaultValue={isCustomer ? "verify" : "generate"} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                {isCustomer && (
                  <TabsTrigger value="verify" className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Verify Arrival
                  </TabsTrigger>
                )}
                {isMechanic && (
                  <TabsTrigger value="generate" className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    Generate Code
                  </TabsTrigger>
                )}
              </TabsList>

              {isCustomer && (
                <TabsContent value="verify" className="mt-6">
                  <ArrivalVerification 
                    jobId={selectedJobId}
                    onVerificationSuccess={() => {
                      // Optionally refresh job status or show success message
                    }}
                  />
                </TabsContent>
              )}

              {isMechanic && (
                <TabsContent value="generate" className="mt-6">
                  <MechanicCodeGenerator 
                    jobId={selectedJobId}
                    customerName="Customer" // Could be fetched from job details
                  />
                </TabsContent>
              )}
            </Tabs>
          )}

          {!selectedJobId && (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>How Arrival Verification Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h3 className="font-semibold text-green-700">For Mechanics:</h3>
                      <ol className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                          <span>Generate arrival code before heading to customer location</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                          <span>Share the code with customer upon arrival</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-green-100 text-green-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                          <span>Begin work once customer verifies your arrival</span>
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold text-blue-700">For Customers:</h3>
                      <ol className="text-sm space-y-2 text-muted-foreground">
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                          <span>Wait for mechanic to arrive at your location</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                          <span>Request arrival verification code from mechanic</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="bg-blue-100 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                          <span>Enter code to confirm mechanic's presence</span>
                        </li>
                      </ol>
                    </div>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                    <h4 className="font-semibold text-amber-800 mb-2">Security Notice</h4>
                    <p className="text-sm text-amber-700">
                      Only verify arrivals when the mechanic is physically present at your location. 
                      This system helps ensure your safety and prevents fraudulent service claims.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default VerificationPage;