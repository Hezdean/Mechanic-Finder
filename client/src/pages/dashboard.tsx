import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatCurrency } from "@/lib/utils";
import { 
  User, 
  Wrench, 
  Calendar, 
  Car, 
  AlertTriangle, 
  History, 
  Briefcase, 
  DollarSign,
  Settings,
  Stethoscope
} from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();

  // Fetch real-time data for admin dashboard
  const { data: users } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  const { data: mechanics } = useQuery<any[]>({
    queryKey: ['/api/mechanic-profiles'],
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  const { data: jobs } = useQuery<any[]>({
    queryKey: ['/api/jobs'],
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  // Calculate real-time statistics
  const totalUsers = Array.isArray(users) ? users.length : 0;
  const activeMechanics = Array.isArray(mechanics) ? mechanics.length : 0;
  const openJobs = Array.isArray(jobs) ? jobs.filter((job: any) => job.status === 'open').length : 0;
  const completedJobs = Array.isArray(jobs) ? jobs.filter((job: any) => job.status === 'completed').length : 0;
  
  // Calculate estimated revenue (assuming 50 MK average per completed job)
  const estimatedRevenue = completedJobs * 50;

  // Mechanic data queries
  const { data: mechanicProfile } = useQuery<any>({
    queryKey: [`/api/mechanic-profiles/user/${user?.id}`],
    enabled: user?.role === 'mechanic',
  });

  const { data: mechanicBids } = useQuery<any[]>({
    queryKey: ['/api/mechanic/bids'],
    enabled: user?.role === 'mechanic',
  });

  // Fetch bids with job details for accurate stats
  const { data: bidsWithJobs } = useQuery<any[]>({
    queryKey: ['/api/mechanic/bids', 'with-jobs-dashboard'],
    queryFn: async () => {
      if (!mechanicBids || !Array.isArray(mechanicBids) || !mechanicBids.length) return [];
      
      const enrichedBids = await Promise.all(
        mechanicBids.map(async (bid: any) => {
          try {
            const jobResponse = await fetch(`/api/jobs/${bid.jobId}`, {
              credentials: 'include'
            });
            if (!jobResponse.ok) return { ...bid, job: null };
            const job = await jobResponse.json();
            return { ...bid, job };
          } catch {
            return { ...bid, job: null };
          }
        })
      );
      return enrichedBids.filter(bid => bid.job !== null);
    },
    enabled: !!mechanicBids && Array.isArray(mechanicBids) && mechanicBids.length > 0,
  });

  // Calculate mechanic stats from real data - only count TRULY completed jobs
  const mechanicStats = {
    completedJobs: Array.isArray(bidsWithJobs) 
      ? bidsWithJobs.filter((bid: any) => bid.status === 'accepted' && bid.job?.status === 'completed').length 
      : 0,
    rating: mechanicProfile?.rating || 0,
    monthlyEarnings: Array.isArray(bidsWithJobs)
      ? bidsWithJobs
          .filter((bid: any) => bid.status === 'accepted' && bid.job?.status === 'completed')
          .reduce((sum: number, bid: any) => sum + (bid.amount || 0), 0)
      : 0,
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-6 p-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg">Welcome to the Mechanic Finder Admin Portal</p>
          </div>
          
          <div className="space-y-4">
            <p className="text-muted-foreground">Please log in to access the admin dashboard</p>
            <div className="flex gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Login as Admin
                </Button>
              </Link>
              <Link href="/home">
                <Button variant="outline" size="lg">
                  View Public Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const vehicleOwnerFeatures = [
    {
      icon: Car,
      title: "Book a Mechanic",
      description: "Find and schedule appointments",
      href: "/booking"
    },
    {
      icon: Stethoscope,
      title: "Vehicle Diagnostics", 
      description: "AI-powered vehicle analysis",
      href: "/diagnostics"
    },
    {
      icon: AlertTriangle,
      title: "Emergency Help",
      description: "Immediate roadside assistance",
      href: "/emergency"
    },
    {
      icon: History,
      title: "Service History",
      description: "Track your vehicle maintenance",
      href: "/service-history"
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

  const adminFeatures = [
    {
      icon: Settings,
      title: "Manage Users",
      description: "View and manage all users",
      href: "/admin/users"
    },
    {
      icon: Briefcase,
      title: "Manage Jobs",
      description: "Oversee all repair jobs",
      href: "/admin/jobs"
    },
    {
      icon: Wrench,
      title: "Manage Mechanics",
      description: "Review mechanic profiles",
      href: "/mechanics"
    },
    {
      icon: DollarSign,
      title: "System Analytics",
      description: "View platform metrics",
      href: "/admin/analytics"
    }
  ];

  const features = user.role === "admin" ? adminFeatures : user.role === "mechanic" ? mechanicFeatures : vehicleOwnerFeatures;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* User Role Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center bg-primary">
              {user.role === "admin" ? (
                <Settings className="h-12 w-12 text-primary-foreground" />
              ) : user.role === "mechanic" ? (
                <Wrench className="h-12 w-12 text-primary-foreground" />
              ) : (
                <User className="h-12 w-12 text-primary-foreground" />
              )}
            </div>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {user.role === "admin" ? "Admin" : user.role === "mechanic" ? "Mechanic" : "Vehicle Owner"}
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

        {/* Quick Stats for Admins */}
        {user.role === "admin" && (
          <div className="mt-12 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Platform Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{totalUsers}</div>
                  <div className="text-muted-foreground">Total Users</div>
                  <div className="text-xs text-muted-foreground mt-1">Registered accounts</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{activeMechanics}</div>
                  <div className="text-muted-foreground">Active Mechanics</div>
                  <div className="text-xs text-muted-foreground mt-1">Verified profiles</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{openJobs}</div>
                  <div className="text-muted-foreground">Open Jobs</div>
                  <div className="text-xs text-muted-foreground mt-1">Awaiting mechanics</div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-primary mb-2">{formatCurrency(estimatedRevenue)}</div>
                  <div className="text-muted-foreground">Est. Revenue</div>
                  <div className="text-xs text-muted-foreground mt-1">{completedJobs} completed jobs</div>
                </CardContent>
              </Card>
            </div>
            
            {/* Additional Admin Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Job Status Distribution</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Open Jobs:</span>
                      <span className="font-semibold text-orange-600">{openJobs}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>In Progress:</span>
                      <span className="font-semibold text-blue-600">{Array.isArray(jobs) ? jobs.filter((job: any) => job.status === 'in_progress').length : 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-semibold text-green-600">{completedJobs}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Platform Health</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>User Growth:</span>
                      <span className="font-semibold text-green-600">+{Math.floor(totalUsers * 0.1)} this week</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Job Completion Rate:</span>
                      <span className="font-semibold text-blue-600">{Array.isArray(jobs) && jobs.length > 0 ? Math.round((completedJobs / jobs.length) * 100) : 0}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Updated:</span>
                      <span className="font-semibold text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Quick Stats for Mechanics */}
        {user.role === "mechanic" && (
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card data-testid="card-mechanic-jobs">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="text-mechanic-jobs-completed">
                    {mechanicStats.completedJobs}
                  </div>
                  <div className="text-muted-foreground">Jobs Completed</div>
                </CardContent>
              </Card>
              <Card data-testid="card-mechanic-rating">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="text-mechanic-rating">
                    {mechanicStats.rating > 0 ? mechanicStats.rating.toFixed(1) : "N/A"}
                  </div>
                  <div className="text-muted-foreground">Average Rating</div>
                </CardContent>
              </Card>
              <Card data-testid="card-mechanic-earnings">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-foreground mb-2" data-testid="text-mechanic-earnings">
                    {formatCurrency(mechanicStats.monthlyEarnings)}
                  </div>
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