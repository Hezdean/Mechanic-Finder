import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";

const MECHANIC_USER = {
  id: 4,
  username: "mechanicguy",
  email: "mechanic@example.com",
  firstName: "Mike",
  lastName: "Mechanic",
  role: "mechanic",
  profilePicture: ""
};

export default function QuickLogin() {
  const [, navigate] = useLocation();
  
  useEffect(() => {
    // Store the user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(MECHANIC_USER));
    
    // Store in sessionStorage too for double security
    sessionStorage.setItem('currentUser', JSON.stringify(MECHANIC_USER));
    
    // Redirect to mechanic dashboard immediately
    window.location.href = "/dashboard/mechanic";
  }, []);
  
  return (
    <>
      <Helmet>
        <title>Quick Login - Mechanic Finder</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Logging you in...</h1>
          <p>Please wait while we redirect you to your dashboard.</p>
        </div>
      </div>
    </>
  );
}