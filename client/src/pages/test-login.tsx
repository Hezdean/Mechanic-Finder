import { useState } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestLogin() {
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (username: string, role: string) => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: username,
          password: '123456' // Default password for all test users
        })
      });

      if (response.ok) {
        const user = await response.json();
        setMessage(`Logged in as ${user.firstName} ${user.lastName} (${user.role})`);
        
        // Redirect based on role
        if (role === 'user') {
          navigate('/dashboard/user');
        } else if (role === 'mechanic') {
          navigate('/dashboard/mechanic');
        } else {
          navigate('/dashboard/admin');
        }
      } else {
        const error = await response.json();
        setMessage(`Login failed: ${error.message}`);
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    }

    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Test Login - Mechanic Finder</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Quick Test Login</CardTitle>
              <CardDescription className="text-center">
                Choose a test account to login with
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={() => handleLogin('JaneDoe', 'user')}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                Login as Car Owner (Jane Doe)
              </Button>
              
              <Button
                onClick={() => handleLogin('BobMechanic', 'mechanic')}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                Login as Mechanic (Bob)
              </Button>
              
              <Button
                onClick={() => handleLogin('admin', 'admin')}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                Login as Admin
              </Button>

              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes('failed') || message.includes('Error') 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                }`}>
                  {message}
                </div>
              )}

              {isLoading && (
                <div className="text-center text-gray-500">
                  Logging in...
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}