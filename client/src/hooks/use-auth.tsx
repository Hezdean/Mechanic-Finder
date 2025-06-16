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
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  // Check if we have a stored token and user
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('currentUser');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse stored user:", e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Get current user (only if we have a token)
  const { isLoading } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!token,
    staleTime: 300000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest('/api/auth/login', 'POST', credentials)
        .then(res => res.json()),
    onSuccess: (data) => {
      setUser(data.user);
      setToken(data.token);
      // Store both user and token
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      localStorage.setItem('authToken', data.token);
      queryClient.invalidateQueries({queryKey: ['/api/auth/me']});
      toast({
        title: "Login successful",
        description: `Welcome back, ${data.user.firstName}!`,
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

  // Logout function (JWT tokens are stateless, no server-side logout needed)
  const logout = async (): Promise<void> => {
    setUser(null);
    setToken(null);
    // Clear storage on logout
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    queryClient.invalidateQueries();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

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
    const result = await loginMutation.mutateAsync(credentials);
    return result.user;
  };

  const register = async (data: RegisterData): Promise<User> => {
    return registerMutation.mutateAsync(data);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
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
