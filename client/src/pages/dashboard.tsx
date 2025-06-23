import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { 
  User, 
  Wrench, 
  Calendar, 
  Car, 
  AlertTriangle, 
  History, 
  Briefcase, 
  DollarSign,
  Settings
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h1>
        </div>
      </div>
    );
  }

  const vehicleOwnerFeatures = [
    {
      icon: <Wrench className="h-12 w-12" />,
      title: "Book a Mechanic",
      description: "Find and schedule appointments",
      href: "/booking",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      iconBg: "bg-orange-400"
    },
    {
      icon: <Car className="h-12 w-12" />,
      title: "Vehicle Diagnostics", 
      description: "AI-powered vehicle analysis",
      href: "/diagnostics",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      iconBg: "bg-orange-400"
    },
    {
      icon: <AlertTriangle className="h-12 w-12" />,
      title: "Emergency Help",
      description: "Immediate roadside assistance",
      href: "/emergency",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      iconBg: "bg-red-500"
    },
    {
      icon: <History className="h-12 w-12" />,
      title: "Service History",
      description: "Track your vehicle maintenance",
      href: "/service-history",
      bgColor: "bg-blue-600 hover:bg-blue-700",
      iconBg: "bg-blue-400"
    }
  ];

  const mechanicFeatures = [
    {
      icon: Briefcase,
      title: "Available Jobs",
      description: "Browse and bid on jobs",
      href: "/jobs"
    },
    {
      icon: Settings,
      title: "Job History",
      description: "View completed work",
      href: "/dashboard/mechanic/history"
    },
    {
      icon: DollarSign,
      title: "Earnings",
      description: "Track your income",
      href: "/transactions"
    }
  ];

  const features = user.role === "mechanic" ? mechanicFeatures : vehicleOwnerFeatures;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* User Role Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
              user.role === "mechanic" ? "bg-primary" : "bg-primary"
            }`}>
              {user.role === "mechanic" ? (
                <Wrench className="h-12 w-12 text-primary-foreground" />
              ) : (
                <User className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {user.role === "mechanic" ? "Mechanic" : "Vehicle Owner"}
          </h1>
          <p className="text-muted-foreground text-lg">
            Welcome back, {user.firstName || user.username}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href}>
              <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border hover:border-primary/50 transform hover:scale-105">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-primary/10 p-4 rounded-xl mr-6 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-12 w-12 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
                      <p className="text-muted-foreground group-hover:text-foreground transition-colors">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Quick Stats for Mechanics */}
        {user.role === "mechanic" && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">12</div>
                  <div className="text-muted-foreground">Jobs Completed</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">4.8</div>
                  <div className="text-muted-foreground">Average Rating</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2">$2,450</div>
                  <div className="text-muted-foreground">This Month</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;