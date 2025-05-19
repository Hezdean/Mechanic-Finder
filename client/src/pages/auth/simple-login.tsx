import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Helmet } from "react-helmet";

const DEFAULT_MECHANIC_USER = {
  id: 4,
  username: "mechanicguy",
  email: "mechanic@example.com",
  firstName: "Mike",
  lastName: "Mechanic",
  role: "mechanic",
  profilePicture: ""
};

export default function SimpleLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Using a timeout to simulate network request
    setTimeout(() => {
      // Store user data in session storage for persistence
      sessionStorage.setItem("currentUser", JSON.stringify(DEFAULT_MECHANIC_USER));
      
      toast({
        title: "Login successful",
        description: "Welcome, Mike Mechanic!",
      });
      
      // Redirect to mechanic dashboard
      navigate("/dashboard/mechanic");
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <>
      <Helmet>
        <title>Simple Login - Mechanic Finder</title>
      </Helmet>
      
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              Simple Test Login
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username (any value works)
                </label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter any username"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password (any value works)
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter any password"
                />
              </div>
              
              <Button
                type="submit"
                className="w-full bg-accent hover:bg-accent/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login as Mechanic"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex flex-col text-center text-sm text-neutral-500">
            <p>
              This is a simplified login page that will log you in as Mike Mechanic
              for testing the profile editing feature.
            </p>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}