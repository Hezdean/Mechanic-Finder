import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Helmet } from "react-helmet";
import { Loader2 } from "lucide-react";

export default function DirectLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Mechanic User Data
  const mechanicUser = {
    id: 4,
    username: "mechanicguy",
    email: "mechanic@example.com",
    firstName: "Mike",
    lastName: "Mechanic",
    role: "mechanic",
    profilePicture: ""
  };

  useEffect(() => {
    // Automatically log in as mechanic
    const loginAsMechanic = async () => {
      try {
        setIsLoading(true);
        
        // Store user data in localStorage AND sessionStorage for maximum compatibility
        localStorage.setItem("currentUser", JSON.stringify(mechanicUser));
        sessionStorage.setItem("currentUser", JSON.stringify(mechanicUser));
        
        // Wait a bit to simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        toast({
          title: "Login successful",
          description: "Welcome, Mike Mechanic!",
        });
        
        // Redirect to mechanic dashboard
        navigate("/dashboard/mechanic");
      } catch (error) {
        console.error("Auto-login error:", error);
        toast({
          title: "Login failed",
          description: "Could not automatically log you in. Please try manual login.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loginAsMechanic();
  }, [navigate, toast]);

  return (
    <>
      <Helmet>
        <title>Automatic Login - Mechanic Finder</title>
      </Helmet>
      
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 p-4">
        <Card className="w-full max-w-md mx-auto text-center">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              Automatic Login
            </CardTitle>
            <CardDescription>
              Logging you in as a mechanic user...
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center justify-center py-8">
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Logging you in automatically...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <p>If you are not redirected automatically, click the button below:</p>
                <Button 
                  onClick={() => navigate("/dashboard/mechanic")}
                  className="bg-accent hover:bg-accent/90 text-white"
                >
                  Go to Mechanic Dashboard
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}