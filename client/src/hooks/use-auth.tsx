import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  profilePicture?: string;
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if we have a stored user from session storage or local storage
  useEffect(() => {
    // Try session storage first
    const sessionUser = sessionStorage.getItem('currentUser');
    if (sessionUser) {
      try {
        const parsedUser = JSON.parse(sessionUser);
        setUser(parsedUser);
        return; // Exit if we found user in session storage
      } catch (e) {
        console.error("Failed to parse stored user from session storage:", e);
        sessionStorage.removeItem('currentUser');
      }
    }
    
    // Try local storage as fallback
    const localUser = localStorage.getItem('currentUser');
    if (localUser) {
      try {
        const parsedUser = JSON.parse(localUser);
        setUser(parsedUser);
        // Also update session storage
        sessionStorage.setItem('currentUser', localUser);
      } catch (e) {
        console.error("Failed to parse stored user from local storage:", e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Get current user
  const { isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    onSuccess: (userData: any) => {
      if (userData) {
        setUser(userData);
        // Store in session storage for persistence
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
      } else {
        const storedUser = sessionStorage.getItem('currentUser');
        if (!storedUser) {
          setUser(null);
        }
      }
    },
    staleTime: 300000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest('/api/auth/login', 'POST', credentials)
        .then(res => res.json()),
    onSuccess: (data) => {
      setUser(data);
      // Store user data in both storages for persistence
      localStorage.setItem('currentUser', JSON.stringify(data));
      sessionStorage.setItem('currentUser', JSON.stringify(data));
      queryClient.invalidateQueries({queryKey: ['/api/auth/me']});
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.firstName}!`,
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('/api/auth/logout', 'POST'),
    onSuccess: () => {
      setUser(null);
      // Clear storage on logout
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      queryClient.invalidateQueries();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      navigate("/");
    },
    onError: (error) => {
      // Even if the API call fails, we should still clear local storage
      setUser(null);
      localStorage.removeItem('currentUser');
      sessionStorage.removeItem('currentUser');
      
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
      navigate("/");
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      apiRequest('/api/users', 'POST', data)
        .then(res => res.json()),
    onSuccess: (data) => {
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully. You can now login.",
      });
      return data;
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    },
  });

  const login = async (credentials: LoginCredentials): Promise<User> => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async (): Promise<void> => {
    await logoutMutation.mutateAsync();
  };

  const register = async (data: RegisterData): Promise<User> => {
    return registerMutation.mutateAsync(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Helper function to handle 401 errors
function getQueryFn({ on401 }: { on401: "returnNull" | "throw" }) {
  return async ({ queryKey }: { queryKey: string[] }) => {
    try {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });

      if (on401 === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text || res.statusText}`);
      }

      return await res.json();
    } catch (error) {
      if (on401 === "returnNull") {
        return null;
      }
      throw error;
    }
  };
}
