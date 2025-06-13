import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getStatusBadgeColor, formatDate } from "@/lib/utils";
import { 
  PlusCircle, 
  Car, 
  Wrench, 
  MessageSquare,
  CheckCircle,
  User,
  Star
} from "lucide-react";

const UserDashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  // Redirect if not car owner
  if (!user || user.role !== "user") {
    navigate("/");
    return null;
  }

  // My jobs query
  const { data: myJobs, isLoading: isLoadingMyJobs } = useQuery({
    queryKey: [`/api/jobs?userId=${user.id}`],
  });

  // Type the jobs data properly
  const jobsArray = (myJobs as any[]) || [];
  
  // Completed jobs for reviews
  const completedJobs = jobsArray.filter((job: any) => job.status === 'completed');

  return (
    <>
      <Helmet>
        <title>Dashboard - Same-Shit Auto Repairs</title>
        <meta name="description" content="Manage your repair jobs, review mechanics, and track your auto repair history." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your repair jobs and mechanic reviews</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobsArray.filter((job: any) => job.status !== 'completed' && job.status !== 'canceled').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Jobs currently in progress or awaiting bids
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed Repairs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {jobsArray.filter((job: any) => job.status === 'completed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully completed repair jobs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Reviews</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedJobs.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Completed jobs awaiting your review
              </p>
            </CardContent>
          </Card>
        </div>

        {/* New Job Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h2 className="text-xl font-bold flex items-center">
                  <Car className="mr-2 h-5 w-5 text-primary-500" />
                  Need a car repair?
                </h2>
                <p className="text-muted-foreground mt-1">
                  Post a new job and receive bids from qualified mechanics.
                </p>
              </div>
              <Link href="/jobs/post">
                <Button className="bg-secondary-500 hover:bg-secondary-600">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="active">Active Jobs</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>
          
          {/* Active Jobs Tab */}
          <TabsContent value="active">
            <Card>
              <CardHeader>
                <CardTitle>My Active Repair Jobs</CardTitle>
                <CardDescription>
                  Track the status of your current repair requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMyJobs ? (
                  <div className="text-center py-6">Loading your jobs...</div>
                ) : jobsArray.filter((job: any) => job.status !== 'completed' && job.status !== 'canceled').length ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Posted</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Bids</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobsArray
                          .filter((job: any) => job.status !== 'completed' && job.status !== 'canceled')
                          .map((job: any) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.vehicle}</TableCell>
                              <TableCell>{formatDate(job.createdAt)}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(job.status)}>
                                  {job.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{job.bidCount || 0}</span>
                                  {job.bidCount > 0 && job.status === 'open' && (
                                    <Badge className="bg-accent text-white text-xs">
                                      New
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant={job.bidCount > 0 && job.status === 'open' ? "default" : "outline"}
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                    className={job.bidCount > 0 && job.status === 'open' ? "bg-accent hover:bg-accent/90" : ""}
                                  >
                                    {job.bidCount > 0 && job.status === 'open' ? 'Review Bids' : 'View'}
                                  </Button>
                                  {job.status === 'in_progress' && (
                                    <Button 
                                      size="sm" 
                                      variant="secondary"
                                      onClick={() => navigate(`/messages?jobId=${job.id}`)}
                                    >
                                      Message
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-neutral-50 rounded-md">
                    <Car className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-4 text-lg font-medium">No active jobs</h3>
                    <p className="mt-2 text-neutral-500">
                      You don't have any active repair jobs. Post a new job to get started.
                    </p>
                    <Link href="/jobs/post">
                      <Button className="mt-4 bg-secondary-500 hover:bg-secondary-600">
                        Post a Job
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Completed Jobs Tab */}
          <TabsContent value="completed">
            <Card>
              <CardHeader>
                <CardTitle>Completed Repairs</CardTitle>
                <CardDescription>
                  View your repair history and leave reviews for mechanics
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingMyJobs ? (
                  <div className="text-center py-6">Loading completed jobs...</div>
                ) : jobsArray.filter((job: any) => job.status === 'completed').length ? (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead>Completed</TableHead>
                          <TableHead>Mechanic</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {myJobs
                          .filter((job: any) => job.status === 'completed')
                          .map((job: any) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.vehicle}</TableCell>
                              <TableCell>{formatDate(job.updatedAt)}</TableCell>
                              <TableCell>{job.assignedMechanicName || 'Unknown'}</TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => navigate(`/jobs/${job.id}`)}
                                  >
                                    View
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    className="bg-primary-500 hover:bg-primary-600"
                                  >
                                    Review
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-neutral-50 rounded-md">
                    <CheckCircle className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-4 text-lg font-medium">No completed jobs</h3>
                    <p className="mt-2 text-neutral-500">
                      You don't have any completed repair jobs yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Messages Tab */}
          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>My Messages</CardTitle>
                <CardDescription>
                  Communicate with mechanics about your repair jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 bg-neutral-50 rounded-md">
                  <MessageSquare className="mx-auto h-12 w-12 text-neutral-400" />
                  <h3 className="mt-4 text-lg font-medium">Access your messages</h3>
                  <p className="mt-2 text-neutral-500">
                    View and respond to messages from mechanics working on your repairs.
                  </p>
                  <Link href="/messages">
                    <Button className="mt-4">
                      Go to Messages
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Account Settings Card */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-primary-500" />
              Account Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-1">Name</h3>
                <p>{user.firstName} {user.lastName}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Email</h3>
                <p>{user.email}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Username</h3>
                <p>{user.username}</p>
              </div>
              <div>
                <h3 className="font-medium mb-1">Account Type</h3>
                <p className="capitalize">{user.role}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default UserDashboard;
