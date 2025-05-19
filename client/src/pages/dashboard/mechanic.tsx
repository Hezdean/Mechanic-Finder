import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate, getBidStatusBadgeColor } from "@/lib/utils";
import { 
  Wrench, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  MessageSquare,
  UserCheck,
  FileText,
  Award
} from "lucide-react";

const createProfileSchema = z.object({
  specializations: z.string().min(1, "Please provide at least one specialization"),
  yearsOfExperience: z.string().min(1, "Years of experience is required"),
  certifications: z.string().optional(),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  isMobile: z.string().min(1, "Please specify if you offer mobile services"),
  servicesOffered: z.string().min(1, "Please provide at least one service"),
  bio: z.string().optional(),
});

type CreateProfileFormValues = z.infer<typeof createProfileSchema>;

const createBidSchema = z.object({
  amount: z.string().min(1, "Bid amount is required"),
  description: z.string().min(10, "Please provide a detailed description"),
  estimatedTime: z.string().min(1, "Estimated completion time is required"),
});

type CreateBidFormValues = z.infer<typeof createBidSchema>;

const MechanicDashboard = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isProfileFormOpen, setIsProfileFormOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [isBidFormOpen, setIsBidFormOpen] = useState(false);

  // Redirect if not mechanic
  if (!user || user.role !== "mechanic") {
    navigate("/");
    return null;
  }

  // Mechanic profile query
  const { 
    data: profile, 
    isLoading: isLoadingProfile,
    isError: isProfileError, 
  } = useQuery({
    queryKey: [`/api/mechanic-profiles/user/${user.id}`],
  });

  // Open jobs query (jobs that a mechanic can bid on)
  const { data: openJobs, isLoading: isLoadingOpenJobs } = useQuery({
    queryKey: ['/api/jobs?status=open'],
    select: (data) => data?.filter((job: any) => job.status === 'open')
  });

  // My bids query
  const { data: myBids, isLoading: isLoadingMyBids } = useQuery({
    queryKey: [`/api/mechanic-profiles/user/${user.id}`, user.id],
    queryFn: async () => {
      // First check if profile exists
      if (!profile) return [];
      
      // Get all jobs
      const response = await fetch('/api/jobs', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }
      
      const allJobs = await response.json();
      
      // Get bids for each job and filter to only include this mechanic's bids
      const bidsPromises = allJobs.map(async (job: any) => {
        try {
          const bidsResponse = await fetch(`/api/jobs/${job.id}/bids`, {
            credentials: 'include'
          });
          
          if (!bidsResponse.ok) return null;
          
          const bids = await bidsResponse.json();
          return bids.filter((bid: any) => bid.mechanicId === user.id)
            .map((bid: any) => ({
              ...bid,
              job
            }));
        } catch (error) {
          return null;
        }
      });
      
      const bidsArrays = await Promise.all(bidsPromises);
      return bidsArrays.flat().filter(Boolean);
    },
    enabled: !!profile && !!user.id,
  });

  // Active jobs query (jobs that this mechanic is working on)
  const { data: activeJobs, isLoading: isLoadingActiveJobs } = useQuery({
    queryKey: ['/api/jobs?status=in_progress'],
    select: (data) => data?.filter((job: any) => job.assignedMechanicId === user.id)
  });

  // Create profile mutation
  const createProfileMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/mechanic-profiles', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/mechanic-profiles/user/${user.id}`] });
      setIsProfileFormOpen(false);
      toast({
        title: "Profile created",
        description: "Your mechanic profile has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Profile creation failed",
        description: error.message || "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create bid mutation
  const createBidMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/bids', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      setIsBidFormOpen(false);
      setSelectedJobId(null);
      toast({
        title: "Bid submitted",
        description: "Your bid has been submitted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Bid submission failed",
        description: error.message || "Failed to submit your bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Profile creation form
  const profileForm = useForm<CreateProfileFormValues>({
    resolver: zodResolver(createProfileSchema),
    defaultValues: {
      specializations: "",
      yearsOfExperience: "",
      certifications: "",
      hourlyRate: "",
      isMobile: "false",
      servicesOffered: "",
      bio: "",
    },
  });

  // Bid creation form
  const bidForm = useForm<CreateBidFormValues>({
    resolver: zodResolver(createBidSchema),
    defaultValues: {
      amount: "",
      description: "",
      estimatedTime: "",
    },
  });

  const onProfileSubmit = (data: CreateProfileFormValues) => {
    console.log("Submitting profile form with data:", data);
    // Convert form string values to appropriate types
    const processedData = {
      userId: user.id,
      specializations: data.specializations.split(',').map(s => s.trim()),
      yearsOfExperience: parseInt(data.yearsOfExperience),
      certifications: data.certifications ? data.certifications.split(',').map(c => c.trim()) : [],
      hourlyRate: parseInt(data.hourlyRate),
      isMobile: data.isMobile === "true",
      servicesOffered: data.servicesOffered.split(',').map(s => s.trim()),
      verificationDocuments: [], // These would be handled with file uploads in a real app
    };
    
    // Directly make API call to ensure form submission works
    fetch('/api/mechanic-profiles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(processedData)
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(err.message || "Failed to create profile");
        });
      }
      return response.json();
    })
    .then(data => {
      queryClient.invalidateQueries({ queryKey: [`/api/mechanic-profiles/user/${user.id}`] });
      setIsProfileFormOpen(false);
      toast({
        title: "Profile created",
        description: "Your mechanic profile has been created successfully.",
      });
    })
    .catch(error => {
      console.error("Error creating profile:", error);
      toast({
        title: "Profile creation failed",
        description: error.message || "Failed to create your profile. Please try again.",
        variant: "destructive",
      });
    });
  };

  const onBidSubmit = (data: CreateBidFormValues) => {
    if (!selectedJobId) return;
    
    const processedData = {
      jobId: selectedJobId,
      mechanicId: user.id,
      amount: parseInt(data.amount),
      description: data.description,
      estimatedTime: data.estimatedTime,
    };
    
    createBidMutation.mutate(processedData);
  };

  const handleBidOnJob = (jobId: number) => {
    setSelectedJobId(jobId);
    setIsBidFormOpen(true);
    bidForm.reset();
  };

  return (
    <>
      <Helmet>
        <title>Mechanic Dashboard - Mechanic Finder</title>
        <meta name="description" content="Mechanic dashboard to manage your auto repair services, bids, and jobs." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Mechanic Dashboard</h1>
          <p className="text-muted-foreground">Manage your mechanic profile, bids, and active jobs</p>
        </div>
        
        {/* Profile Creation Dialog */}
        <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Your Mechanic Profile</DialogTitle>
              <DialogDescription>
                Provide your professional details to get started as a mechanic on our platform.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="specializations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specializations</FormLabel>
                      <FormControl>
                        <Input placeholder="Engine Repair, Transmission, Diagnostics (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="yearsOfExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="certifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Certifications (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="ASE, BMW Certified (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input type="number" min={0} placeholder="75" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="isMobile"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Do you offer mobile services?</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="servicesOffered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <FormControl>
                        <Input placeholder="Oil Change, Tire Rotation, Brake Repair (comma separated)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={profileForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About You (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your experience and qualifications..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsProfileFormOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-accent hover:bg-accent/90"
                    disabled={createProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {isLoadingProfile ? (
          <div className="text-center py-8">Loading your profile...</div>
        ) : !profile && !isProfileError ? (
          // Profile creation card
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create Your Mechanic Profile</CardTitle>
              <CardDescription>
                Set up your profile to start receiving auto repair jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                You need to create your mechanic profile before you can bid on jobs.
                Your profile helps car owners understand your expertise and qualifications.
              </p>
              <Button onClick={() => setIsProfileFormOpen(true)}>
                Create Profile
              </Button>
            </CardContent>
          </Card>
        ) : profile ? (
          // Profile overview when profile exists
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center">
                  <UserCheck className="mr-2 h-5 w-5 text-primary-500" />
                  Mechanic Profile
                  {profile.isVerified ? (
                    <Badge className="ml-3 bg-green-100 text-green-800">Verified</Badge>
                  ) : (
                    <Badge className="ml-3 bg-amber-100 text-amber-800">Pending Verification</Badge>
                  )}
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center"
                  onClick={() => setShowEditProfile(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-medium text-lg mb-2">Your Specializations</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.specializations?.map((spec: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="font-medium text-lg mb-2">Services Offered</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.servicesOffered?.map((service: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {service}
                      </Badge>
                    ))}
                  </div>
                  
                  <h3 className="font-medium text-lg mb-2">Certifications</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications?.length ? profile.certifications.map((cert: string, index: number) => (
                      <Badge key={index} className="bg-blue-100 text-blue-800">
                        {cert}
                      </Badge>
                    )) : (
                      <span className="text-neutral-500">No certifications listed</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-lg mb-2">Experience</h3>
                      <p>{profile.yearsOfExperience} years</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Hourly Rate</h3>
                      <p>{formatCurrency(profile.hourlyRate)}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Mobile Service</h3>
                      <p>{profile.isMobile ? "Yes" : "No"}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-2">Rating</h3>
                      <p>{profile.rating / 10} ({profile.reviewCount} reviews)</p>
                    </div>
                  </div>
                  
                  {!profile.isVerified && (
                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium flex items-center">
                        <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
                        Pending Verification
                      </h3>
                      <p className="text-sm mt-2">
                        Your profile is currently under review by our admin team. This usually takes 1-2 business days.
                        You'll be able to bid on jobs once your profile is verified.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Profile error state
          <Card className="mb-8 border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p>There was an error loading your profile. Please try again later.</p>
              <Button 
                className="mt-4" 
                onClick={() => queryClient.invalidateQueries({ queryKey: [`/api/mechanic-profiles/user/${user.id}`] })}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Only show the tabs if the profile exists */}
        {profile && (
          <Tabs defaultValue="active-jobs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
              <TabsTrigger value="my-bids">My Bids</TabsTrigger>
              <TabsTrigger value="available-jobs">Available Jobs</TabsTrigger>
            </TabsList>
            
            {/* Active Jobs Tab */}
            <TabsContent value="active-jobs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-primary-500" />
                    Jobs You're Working On
                  </CardTitle>
                  <CardDescription>
                    Current repair jobs assigned to you
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingActiveJobs ? (
                    <div className="text-center py-6">Loading active jobs...</div>
                  ) : activeJobs?.length ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {activeJobs.map((job: any) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.vehicle}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>
                                <Badge className="bg-amber-100 text-amber-800">
                                  In Progress
                                </Badge>
                              </TableCell>
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
                                    variant="secondary"
                                    onClick={() => navigate(`/messages?jobId=${job.id}`)}
                                  >
                                    Message
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
                      <Car className="mx-auto h-12 w-12 text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">No active jobs</h3>
                      <p className="mt-2 text-neutral-500">
                        You don't have any active jobs yet. Bid on available jobs to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* My Bids Tab */}
            <TabsContent value="my-bids">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5 text-primary-500" />
                    My Bids
                  </CardTitle>
                  <CardDescription>
                    Track the status of bids you've placed on jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingMyBids ? (
                    <div className="text-center py-6">Loading your bids...</div>
                  ) : myBids?.length ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Bid Amount</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {myBids.map((bid: any) => (
                            <TableRow key={bid.id}>
                              <TableCell className="font-medium">{bid.job.title}</TableCell>
                              <TableCell>{formatCurrency(bid.amount)}</TableCell>
                              <TableCell>{formatDate(bid.createdAt)}</TableCell>
                              <TableCell>
                                <Badge className={getBidStatusBadgeColor(bid.status)}>
                                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => navigate(`/jobs/${bid.job.id}`)}
                                >
                                  View Job
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-neutral-50 rounded-md">
                      <Clock className="mx-auto h-12 w-12 text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">No bids placed yet</h3>
                      <p className="mt-2 text-neutral-500">
                        You haven't placed any bids on jobs yet. Browse available jobs to get started.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Available Jobs Tab */}
            <TabsContent value="available-jobs">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="mr-2 h-5 w-5 text-primary-500" />
                    Available Jobs
                  </CardTitle>
                  <CardDescription>
                    Browse jobs available for bidding
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!profile.isVerified ? (
                    <div className="text-center py-8 bg-amber-50 rounded-md border border-amber-200">
                      <AlertCircle className="mx-auto h-12 w-12 text-amber-500" />
                      <h3 className="mt-4 text-lg font-medium">Profile Verification Required</h3>
                      <p className="mt-2 text-neutral-500">
                        Your profile needs to be verified by an admin before you can bid on jobs.
                        This usually takes 1-2 business days.
                      </p>
                    </div>
                  ) : isLoadingOpenJobs ? (
                    <div className="text-center py-6">Loading available jobs...</div>
                  ) : openJobs?.length ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Vehicle</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Posted</TableHead>
                            <TableHead>Budget</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {openJobs.map((job: any) => (
                            <TableRow key={job.id}>
                              <TableCell className="font-medium">{job.title}</TableCell>
                              <TableCell>{job.vehicle}</TableCell>
                              <TableCell>{job.location}</TableCell>
                              <TableCell>{formatDate(job.createdAt)}</TableCell>
                              <TableCell>{job.budget ? formatCurrency(job.budget) : 'Not specified'}</TableCell>
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
                                    className="bg-accent hover:bg-accent/90 text-accent-foreground"
                                    onClick={() => handleBidOnJob(job.id)}
                                  >
                                    <Wrench className="mr-1 h-4 w-4" /> Bid
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
                      <h3 className="mt-4 text-lg font-medium">No available jobs</h3>
                      <p className="mt-2 text-neutral-500">
                        There are no open jobs available for bidding right now. Check back soon!
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/jobs')}
                  >
                    Browse All Jobs
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Profile Creation Dialog */}
      <Dialog open={isProfileFormOpen} onOpenChange={setIsProfileFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Your Mechanic Profile</DialogTitle>
            <DialogDescription>
              Provide your professional details to get started as a mechanic on our platform.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="specializations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specializations</FormLabel>
                    <FormControl>
                      <Input placeholder="Engine Repair, Transmission, Diagnostics (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="yearsOfExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="certifications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certifications (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="ASE, BMW Certified (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="hourlyRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="75" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="isMobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you offer mobile service?</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes, I can travel to customers</SelectItem>
                          <SelectItem value="false">No, customers must come to my location</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="servicesOffered"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Services Offered</FormLabel>
                    <FormControl>
                      <Input placeholder="Oil Changes, Brake Service, Engine Diagnostics (comma separated)" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe your background, experience, and approach to auto repair" 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-primary-500 hover:bg-primary-600"
                  disabled={createProfileMutation.isPending}
                >
                  {createProfileMutation.isPending ? "Creating Profile..." : "Create Profile"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Bid Creation Dialog */}
      <Dialog open={isBidFormOpen} onOpenChange={setIsBidFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Submit Your Bid</DialogTitle>
            <DialogDescription>
              Provide your bid details for this repair job.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...bidForm}>
            <form onSubmit={bidForm.handleSubmit(onBidSubmit)} className="space-y-4">
              <FormField
                control={bidForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Amount ($)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} placeholder="250" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bidForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bid Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your approach to this repair, what's included in your bid, and any additional information the owner should know." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={bidForm.control}
                name="estimatedTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Completion Time</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2 hours, 1 day, 3-4 hours" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  className="bg-secondary-500 hover:bg-secondary-600"
                  disabled={createBidMutation.isPending}
                >
                  {createBidMutation.isPending ? "Submitting Bid..." : "Submit Bid"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MechanicDashboard;
