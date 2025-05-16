import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, User, Car, Drill, AlertTriangle, BarChart2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedMechanicId, setSelectedMechanicId] = useState<number | null>(null);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);

  // Redirect if not admin
  if (user?.role !== "admin") {
    navigate("/");
    return null;
  }

  // Query for users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Query for mechanic profiles
  const { data: mechanicProfiles, isLoading: isLoadingProfiles } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
    select: (data) => {
      // Add full user data to each profile
      return data.map((profile: any) => ({
        ...profile,
        fullName: profile.user ? `${profile.user.firstName} ${profile.user.lastName}` : 'Unknown'
      }));
    }
  });

  // Query for jobs
  const { data: jobs, isLoading: isLoadingJobs } = useQuery({
    queryKey: ['/api/jobs'],
  });

  // Mutation for verifying mechanic profiles
  const verifyMutation = useMutation({
    mutationFn: (id: number) => apiRequest('PUT', `/api/mechanic-profiles/${id}/verify`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mechanic-profiles'] });
      toast({
        title: "Mechanic verified",
        description: "The mechanic has been successfully verified.",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification failed",
        description: error.message || "Failed to verify mechanic. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleVerifyMechanic = (id: number) => {
    setSelectedMechanicId(id);
    setIsVerifyDialogOpen(true);
  };

  const confirmVerify = () => {
    if (selectedMechanicId) {
      verifyMutation.mutate(selectedMechanicId);
      setIsVerifyDialogOpen(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalUsers: users?.length || 0,
    totalMechanics: mechanicProfiles?.length || 0,
    pendingVerifications: mechanicProfiles?.filter((p: any) => !p.isVerified).length || 0,
    totalJobs: jobs?.length || 0,
    openJobs: jobs?.filter((job: any) => job.status === 'open').length || 0,
    completedJobs: jobs?.filter((job: any) => job.status === 'completed').length || 0,
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Same-Shit Auto Repairs</title>
        <meta name="description" content="Admin dashboard for managing Same-Shit auto repair marketplace." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, mechanics, and jobs across the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Including {stats.totalMechanics} mechanic(s)
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Jobs</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openJobs}</div>
              <p className="text-xs text-muted-foreground">
                Out of {stats.totalJobs} total jobs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Verifications</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Mechanics awaiting approval
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="mechanics" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="mechanics">Mechanics</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
          </TabsList>
          
          {/* Mechanics Tab */}
          <TabsContent value="mechanics">
            <Card>
              <CardHeader>
                <CardTitle>Mechanics Management</CardTitle>
                <CardDescription>
                  View and manage all mechanic profiles on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingProfiles ? (
                  <div className="text-center py-6">Loading mechanic profiles...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Specializations</TableHead>
                          <TableHead>Experience</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {mechanicProfiles?.length ? (
                          mechanicProfiles.map((profile: any) => (
                            <TableRow key={profile.id}>
                              <TableCell className="font-medium">{profile.fullName}</TableCell>
                              <TableCell>
                                {profile.specializations?.slice(0, 2).join(", ")}
                                {profile.specializations?.length > 2 && "..."}
                              </TableCell>
                              <TableCell>{profile.yearsOfExperience} years</TableCell>
                              <TableCell>
                                {profile.isVerified ? (
                                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => navigate(`/mechanics/${profile.userId}`)}
                                  >
                                    View
                                  </Button>
                                  {!profile.isVerified && (
                                    <Button 
                                      size="sm" 
                                      className="bg-green-600 hover:bg-green-700"
                                      onClick={() => handleVerifyMechanic(profile.id)}
                                    >
                                      Verify
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No mechanic profiles found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Users Management</CardTitle>
                <CardDescription>
                  View and manage all users on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="text-center py-6">Loading users...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Username</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users?.length ? (
                          users.map((user: any) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">{user.firstName} {user.lastName}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.email}</TableCell>
                              <TableCell>
                                <Badge 
                                  className={user.role === 'admin' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : user.role === 'mechanic' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                                  }
                                >
                                  {user.role}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(user.createdAt)}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-4">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Jobs Tab */}
          <TabsContent value="jobs">
            <Card>
              <CardHeader>
                <CardTitle>Jobs Management</CardTitle>
                <CardDescription>
                  Monitor and manage all repair jobs on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingJobs ? (
                  <div className="text-center py-6">Loading jobs...</div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Posted By</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Posted On</TableHead>
                          <TableHead>Bids</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {jobs?.length ? (
                          jobs.map((job: any) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.user ? `${job.user.firstName} ${job.user.lastName}` : 'Unknown'}</TableCell>
                              <TableCell>
                                <Badge
                                  className={job.status === 'open' 
                                    ? 'bg-green-100 text-green-800' 
                                    : job.status === 'in_progress' 
                                    ? 'bg-amber-100 text-amber-800'
                                    : job.status === 'completed'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-red-100 text-red-800'
                                  }
                                >
                                  {job.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{formatDate(job.createdAt)}</TableCell>
                              <TableCell>{job.bidCount || 0}</TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate(`/jobs/${job.id}`)}
                                >
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4">
                              No jobs found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Verify Mechanic Dialog */}
      <AlertDialog open={isVerifyDialogOpen} onOpenChange={setIsVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Mechanic</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to verify this mechanic? This will allow them to bid on jobs and provide services through the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmVerify}
            >
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminDashboard;
