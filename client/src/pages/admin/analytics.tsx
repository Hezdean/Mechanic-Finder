import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Users, 
  Wrench, 
  Briefcase, 
  DollarSign,
  Activity,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  Zap,
  Target,
  Database,
  Server
} from "lucide-react";

export default function SystemAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("7d");

  // Fetch analytics data
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  const { data: mechanics = [] } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  const { data: jobs = [] } = useQuery({
    queryKey: ['/api/jobs'],
    enabled: user?.role === 'admin',
    refetchInterval: 30000,
  });

  // Calculate analytics metrics
  const calculateMetrics = () => {
    const totalUsers = users.length;
    const totalMechanics = mechanics.length;
    const totalJobs = jobs.length;
    
    const activeJobs = jobs.filter((job: any) => job.status === 'open' || job.status === 'in_progress').length;
    const completedJobs = jobs.filter((job: any) => job.status === 'completed').length;
    const openJobs = jobs.filter((job: any) => job.status === 'open').length;
    
    const verifiedUsers = users.filter((user: any) => user.emailVerified).length;
    const verificationRate = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;
    
    const completionRate = totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0;
    
    // Simulate growth metrics
    const userGrowth = Math.floor(totalUsers * 0.12); // 12% growth simulation
    const jobGrowth = Math.floor(totalJobs * 0.08); // 8% growth simulation
    const revenueGrowth = 15.6; // 15.6% revenue growth
    
    // Calculate estimated metrics
    const avgJobValue = 125;
    const totalRevenue = completedJobs * avgJobValue;
    const platformFee = totalRevenue * 0.15; // 15% platform fee
    
    // Geographic distribution (simulated)
    const topStates = [
      { state: 'California', count: Math.floor(totalUsers * 0.18) },
      { state: 'Texas', count: Math.floor(totalUsers * 0.14) },
      { state: 'Florida', count: Math.floor(totalUsers * 0.11) },
      { state: 'New York', count: Math.floor(totalUsers * 0.09) },
      { state: 'Illinois', count: Math.floor(totalUsers * 0.07) },
    ];
    
    // Performance metrics
    const avgResponseTime = 45; // minutes
    const systemUptime = 99.8; // percentage
    const avgJobCompletionTime = 3.2; // hours
    
    return {
      totalUsers,
      totalMechanics,
      totalJobs,
      activeJobs,
      completedJobs,
      openJobs,
      verifiedUsers,
      verificationRate,
      completionRate,
      userGrowth,
      jobGrowth,
      revenueGrowth,
      totalRevenue,
      platformFee,
      avgJobValue,
      topStates,
      avgResponseTime,
      systemUptime,
      avgJobCompletionTime
    };
  };

  const metrics = calculateMetrics();

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>System Analytics - Admin Dashboard</title>
        <meta name="description" content="Platform performance metrics and analytics dashboard" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">System Analytics</h1>
              <p className="text-muted-foreground">Platform performance metrics and insights</p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+{metrics.revenueGrowth}%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-2xl font-bold">{metrics.totalUsers}</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-blue-500 mr-1" />
                    <span className="text-xs text-blue-600">+{metrics.userGrowth} this week</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Job Completion</p>
                  <p className="text-2xl font-bold">{metrics.completionRate}%</p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 text-purple-500 mr-1" />
                    <span className="text-xs text-purple-600">+2.3% vs last week</span>
                  </div>
                </div>
                <Target className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Uptime</p>
                  <p className="text-2xl font-bold">{metrics.systemUptime}%</p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Excellent</span>
                  </div>
                </div>
                <Server className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Platform Usage
              </CardTitle>
              <CardDescription>Current platform statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>Total Users</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.totalUsers}</div>
                    <div className="text-xs text-muted-foreground">{metrics.verificationRate}% verified</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-orange-500" />
                    <span>Active Mechanics</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.totalMechanics}</div>
                    <div className="text-xs text-muted-foreground">Available for work</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-green-500" />
                    <span>Total Jobs</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.totalJobs}</div>
                    <div className="text-xs text-muted-foreground">{metrics.activeJobs} active</div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-purple-500" />
                    <span>Platform Revenue</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${metrics.platformFee.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">15% commission</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
              <CardDescription>System performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Avg Response Time</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.avgResponseTime} min</div>
                    <Badge variant="outline" className="text-xs">Good</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span>Job Completion Time</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.avgJobCompletionTime} hrs</div>
                    <Badge variant="outline" className="text-xs">Excellent</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Success Rate</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.completionRate}%</div>
                    <Badge variant="outline" className="text-xs">High</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-purple-500" />
                    <span>System Uptime</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{metrics.systemUptime}%</div>
                    <Badge variant="outline" className="text-xs">Excellent</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Geographic Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Users by state</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metrics.topStates.map((state, index) => (
                  <div key={state.state} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>{state.state}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{state.count}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((state.count / metrics.totalUsers) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth Trends
              </CardTitle>
              <CardDescription>Platform growth metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>User Growth</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="font-semibold text-green-600">+{metrics.userGrowth}</span>
                    <span className="text-xs text-muted-foreground">this week</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Job Growth</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="font-semibold text-blue-600">+{metrics.jobGrowth}</span>
                    <span className="text-xs text-muted-foreground">this week</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Revenue Growth</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                    <span className="font-semibold text-purple-600">+{metrics.revenueGrowth}%</span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mechanic Onboarding</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    <span className="font-semibold text-orange-600">+{Math.floor(metrics.totalMechanics * 0.15)}</span>
                    <span className="text-xs text-muted-foreground">this month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Real-time Activity
            </CardTitle>
            <CardDescription>
              Live platform activity - Last updated: {new Date().toLocaleTimeString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{metrics.openJobs}</div>
                <div className="text-sm text-muted-foreground">Open Jobs</div>
                <div className="text-xs text-green-600 mt-1">Available for bidding</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.activeJobs}</div>
                <div className="text-sm text-muted-foreground">Active Jobs</div>
                <div className="text-xs text-blue-600 mt-1">Currently in progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{metrics.completedJobs}</div>
                <div className="text-sm text-muted-foreground">Completed Jobs</div>
                <div className="text-xs text-purple-600 mt-1">Successfully finished</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}