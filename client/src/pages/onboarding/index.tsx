import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  ArrowRight, 
  Wrench, 
  Car, 
  Shield, 
  Smartphone,
  MapPin,
  CreditCard,
  Bell,
  Users,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  canSkip?: boolean;
}

export default function OnboardingPage() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<'car_owner' | 'mechanic' | null>(null);

  // Redirect if already authenticated and onboarded
  useEffect(() => {
    if (user && user.role !== 'visitor') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Same-Shit',
      description: 'Your trusted automotive service marketplace',
      icon: <Car className="h-8 w-8" />,
      component: <WelcomeStep onNext={() => nextStep()} />
    },
    {
      id: 'role-selection',
      title: 'Choose Your Role',
      description: 'Are you looking for repairs or offering services?',
      icon: <Users className="h-8 w-8" />,
      component: <RoleSelectionStep 
        onRoleSelect={(role) => {
          setUserRole(role);
          markStepComplete('role-selection');
          nextStep();
        }} 
      />
    },
    {
      id: 'account-setup',
      title: 'Create Your Account',
      description: 'Quick setup to get you started',
      icon: <Shield className="h-8 w-8" />,
      component: <AccountSetupStep 
        role={userRole} 
        onComplete={(userData) => {
          markStepComplete('account-setup');
          nextStep();
        }}
      />
    },
    {
      id: 'profile-completion',
      title: userRole === 'mechanic' ? 'Professional Profile' : 'Vehicle Information',
      description: userRole === 'mechanic' ? 'Set up your service profile' : 'Add your vehicle details',
      icon: userRole === 'mechanic' ? <Wrench className="h-8 w-8" /> : <Car className="h-8 w-8" />,
      component: <ProfileCompletionStep 
        role={userRole}
        onComplete={() => {
          markStepComplete('profile-completion');
          nextStep();
        }}
      />,
      canSkip: true
    },
    {
      id: 'location-setup',
      title: 'Location Services',
      description: 'Enable location for better matches',
      icon: <MapPin className="h-8 w-8" />,
      component: <LocationSetupStep 
        onComplete={() => {
          markStepComplete('location-setup');
          nextStep();
        }}
      />,
      canSkip: true
    },
    {
      id: 'notifications',
      title: 'Stay Updated',
      description: 'Enable notifications for important updates',
      icon: <Bell className="h-8 w-8" />,
      component: <NotificationSetupStep 
        onComplete={() => {
          markStepComplete('notifications');
          nextStep();
        }}
      />,
      canSkip: true
    },
    {
      id: 'completion',
      title: 'You\'re All Set!',
      description: 'Welcome to the Same-Shit community',
      icon: <CheckCircle className="h-8 w-8" />,
      component: <CompletionStep 
        role={userRole}
        onFinish={() => navigate('/dashboard')} 
      />
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipStep = () => {
    const step = steps[currentStep];
    if (step.canSkip) {
      nextStep();
    }
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
  };

  const progress = ((currentStep + 1) / steps.length) * 100;
  const currentStepData = steps[currentStep];

  return (
    <>
      <Helmet>
        <title>Welcome - Same-Shit Onboarding</title>
        <meta name="description" content="Get started with Same-Shit - your trusted automotive service marketplace. Quick and easy setup process." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-md">
          {/* Progress Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  {currentStepData.icon}
                </div>
                <div>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {steps.length}
                  </Badge>
                </div>
              </div>
              {currentStep > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={prevStep}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Back
                </Button>
              )}
            </div>
            
            <Progress value={progress} className="mb-4" />
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Step Content */}
          <div className="mb-8">
            {currentStepData.component}
          </div>

          {/* Skip Button for Optional Steps */}
          {currentStepData.canSkip && (
            <div className="text-center">
              <Button 
                variant="ghost" 
                onClick={skipStep}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip this step
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// Welcome Step Component
function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Car className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-xl font-semibold mb-3">
            Connecting Car Owners with Trusted Mechanics
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Get reliable auto repairs with verified mechanics in your area. 
            Post jobs, receive competitive bids, and enjoy secure payment processing.
          </p>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Verified mechanics with ratings</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Secure arrival verification system</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Protected payment processing</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Real-time job notifications</span>
          </div>
        </div>

        <Button 
          onClick={onNext} 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          size="lg"
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}

// Role Selection Step Component
function RoleSelectionStep({ onRoleSelect }: { onRoleSelect: (role: 'car_owner' | 'mechanic') => void }) {
  return (
    <div className="space-y-4">
      <Card 
        className="border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200"
        onClick={() => onRoleSelect('car_owner')}
      >
        <CardContent className="p-6 text-center">
          <Car className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">I need car repairs</h3>
          <p className="text-gray-600 text-sm">
            Post repair jobs and get competitive bids from verified mechanics in your area.
          </p>
          <Badge className="mt-3 bg-blue-100 text-blue-800">Car Owner</Badge>
        </CardContent>
      </Card>

      <Card 
        className="border-2 border-dashed border-gray-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all duration-200"
        onClick={() => onRoleSelect('mechanic')}
      >
        <CardContent className="p-6 text-center">
          <Wrench className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">I'm a mechanic</h3>
          <p className="text-gray-600 text-sm">
            Find repair jobs, bid on projects, and grow your automotive service business.
          </p>
          <Badge className="mt-3 bg-purple-100 text-purple-800">Mechanic</Badge>
        </CardContent>
      </Card>
    </div>
  );
}

// Account Setup Step Component (Simplified for initial implementation)
function AccountSetupStep({ role, onComplete }: { role: 'car_owner' | 'mechanic' | null; onComplete: (userData: any) => void }) {
  const [isCreating, setIsCreating] = useState(false);
  
  const handleContinue = async () => {
    setIsCreating(true);
    // Simulate account creation
    setTimeout(() => {
      setIsCreating(false);
      onComplete({ role, created: true });
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-3">Create Your Account</h3>
        <p className="text-gray-600 text-sm mb-6">
          Join as a {role === 'mechanic' ? 'verified mechanic' : 'car owner'} and start using Same-Shit today
        </p>
        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Secure account creation</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Email verification included</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Profile customization</span>
          </div>
        </div>
        <Button 
          onClick={handleContinue} 
          className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          disabled={isCreating}
        >
          {isCreating ? "Creating Account..." : "Create Account"}
        </Button>
      </CardContent>
    </Card>
  );
}

function ProfileCompletionStep({ role, onComplete }: { role: 'car_owner' | 'mechanic' | null; onComplete: () => void }) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    // Simulate profile completion
    setTimeout(() => {
      setIsCompleting(false);
      onComplete();
    }, 1500);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          {role === 'mechanic' ? (
            <Wrench className="h-6 w-6 text-purple-600" />
          ) : (
            <Car className="h-6 w-6 text-blue-600" />
          )}
        </div>
        <h3 className="text-lg font-semibold mb-3">
          {role === 'mechanic' ? 'Professional Profile' : 'Vehicle Information'}
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          {role === 'mechanic' 
            ? 'Set up your professional profile to attract more customers'
            : 'Add your vehicle details for better service recommendations'
          }
        </p>
        <div className="space-y-3 mb-6 text-left">
          {role === 'mechanic' ? (
            <>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Specializations & certifications</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Service areas & pricing</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Mobile service options</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Vehicle make, model, year</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Service preferences</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">Location settings</span>
              </div>
            </>
          )}
        </div>
        <Button 
          onClick={handleComplete} 
          className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
          disabled={isCompleting}
        >
          {isCompleting ? "Setting up..." : "Complete Profile"}
        </Button>
      </CardContent>
    </Card>
  );
}

function LocationSetupStep({ onComplete }: { onComplete: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);

  const handleLocationRequest = async () => {
    setIsLoading(true);
    try {
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        setLocationGranted(true);
        setTimeout(() => {
          setIsLoading(false);
          onComplete();
        }, 1000);
      }
    } catch {
      setIsLoading(false);
      onComplete();
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold mb-3">Enable Location Services</h3>
        <p className="text-gray-600 text-sm mb-6">
          Help us find the best mechanics near you and provide accurate service estimates
        </p>
        {!locationGranted ? (
          <Button 
            onClick={handleLocationRequest}
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {isLoading ? "Getting Location..." : "Enable Location Access"}
          </Button>
        ) : (
          <div className="space-y-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto" />
            <p className="text-green-600 font-medium">Location access granted!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NotificationSetupStep({ onComplete }: { onComplete: () => void }) {
  const [pushEnabled, setPushEnabled] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setPushEnabled(true);
          new Notification("Same-Shit Notifications Enabled", {
            body: "You'll receive important updates about your jobs",
          });
        }
      }
    } catch (error) {
      console.warn("Notification setup failed:", error);
    }
    onComplete();
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-6 text-center">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bell className="h-6 w-6 text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold mb-3">Stay Updated</h3>
        <p className="text-gray-600 text-sm mb-6">
          Get notified about job updates, new bids, and important messages
        </p>
        <div className="space-y-3 mb-6 text-left">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Job status updates</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">New bid notifications</span>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm">Message alerts</span>
          </div>
        </div>
        <Button 
          onClick={handleEnableNotifications}
          className="w-full h-11 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
        >
          Enable Notifications
        </Button>
      </CardContent>
    </Card>
  );
}

function CompletionStep({ role, onFinish }: { role: 'car_owner' | 'mechanic' | null; onFinish: () => void }) {
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-3">Welcome to Same-Shit!</h2>
        <p className="text-gray-600 mb-6">
          Your account is ready. Start {role === 'mechanic' ? 'finding jobs' : 'posting repair requests'} now.
        </p>
        <Button onClick={onFinish} size="lg" className="w-full">
          Go to Dashboard
        </Button>
      </CardContent>
    </Card>
  );
}