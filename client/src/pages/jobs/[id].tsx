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
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import BidForm from "@/components/job/BidForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  User,
  DollarSign,
  CheckCircle,
  MessageSquare
} from "lucide-react";
import {
  formatDate,
  formatCurrency,
  getStatusBadgeColor,
  getBidStatusBadgeColor,
  getFullName,
} from "@/lib/utils";
import Rating from "@/components/ui/rating";

const JobDetails = () => {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useLocation();
  const jobId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAcceptBidDialogOpen, setIsAcceptBidDialogOpen] = useState(false);
  const [selectedBidId, setSelectedBidId] = useState<number | null>(null);
  const [isBidFormOpen, setIsBidFormOpen] = useState(false);

  // Fetch job details
  const {
    data: job,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [`/api/jobs/${jobId}`],
    enabled: !isNaN(jobId),
  });

  // Accept bid mutation
  const acceptBidMutation = useMutation({
    mutationFn: (bidId: number) => apiRequest('PUT', `/api/bids/${bidId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      toast({
        title: "Bid accepted",
        description: "You've successfully accepted the bid. The mechanic has been notified.",
      });
      setIsAcceptBidDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error accepting bid",
        description: error.message || "An error occurred while accepting the bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAcceptBid = (bidId: number) => {
    setSelectedBidId(bidId);
    setIsAcceptBidDialogOpen(true);
  };

  const confirmAcceptBid = () => {
    if (selectedBidId) {
      acceptBidMutation.mutate(selectedBidId);
    }
  };

  // Check if user is the job owner
  const isJobOwner = job && user?.id === job.userId;

  // Check if user is the assigned mechanic
  const isAssignedMechanic = job && user?.id === job.assignedMechanicId;

  // Check if user can bid on this job (mechanics only, not job owner or already assigned)
  const canBidOnJob = 
    isAuthenticated && 
    user?.role === 'mechanic' && 
    !isJobOwner && 
    !isAssignedMechanic && 
    job?.status === 'open';

  // Check if this mechanic has already bid on the job
  const hasBid = job?.bids?.some((bid: any) => bid.mechanicId === user?.id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/4 mx-auto mb-12"></div>
          <div className="max-w-3xl mx-auto">
            <div className="h-64 bg-neutral-200 rounded mb-8"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-32 bg-neutral-200 rounded"></div>
              <div className="h-32 bg-neutral-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Job</h1>
        <p className="mb-8">We couldn't find the job you're looking for. It may have been removed or doesn't exist.</p>
        <Link href="/jobs">
          <Button>Browse All Jobs</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{job.title} - Mechanic Finder</title>
        <meta name="description" content={`${job.title} - ${job.vehicle} repair job in ${job.location}.`} />
      </Helmet>
      
      {/* Bid Form for mechanics */}
      {user && isBidFormOpen && (
        <BidForm 
          isOpen={isBidFormOpen}
          onClose={() => setIsBidFormOpen(false)}
          jobId={jobId}
          mechanicId={user.id}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <h1 className="text-3xl font-bold">{job.title}</h1>
              <Badge 
                className={`${getStatusBadgeColor(job.status)} mt-2 sm:mt-0 capitalize text-sm py-1 px-3`}
              >
                {job.status.replace('_', ' ')}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-4 text-neutral-500 text-sm">
              <span className="flex items-center">
                <Car className="mr-1 h-4 w-4" />
                {job.vehicle}
              </span>
              <span className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {job.location}
              </span>
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Posted {formatDate(job.createdAt)}
              </span>
              {job.budget && (
                <span className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  Budget: {formatCurrency(job.budget)}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {/* Job Description */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Job Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-line">{job.description}</p>
                  
                  {job.photos && job.photos.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium mb-3">Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {job.photos.map((photo: string, index: number) => (
                          <div key={index} className="rounded-lg bg-neutral-100 aspect-square flex items-center justify-center">
                            <span className="text-sm text-neutral-500">Photo {index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bids Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Bids ({job.bids?.length || 0})</CardTitle>
                  <CardDescription>
                    {job.status === 'open' 
                      ? "Mechanics who have placed bids on this job" 
                      : job.status === 'in_progress'
                      ? "This job has been assigned to a mechanic"
                      : "This job has been completed"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {job.bids?.length > 0 ? (
                    <div className="space-y-6">
                      {job.bids.map((bid: any) => (
                        <div 
                          key={bid.id} 
                          className={`border rounded-lg p-4 ${
                            bid.status === 'accepted' ? 'border-green-300 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3">
                            <div className="flex items-center mb-2 sm:mb-0">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={bid.mechanic?.profilePicture} />
                                <AvatarFallback>
                                  {bid.mechanic ? bid.mechanic.firstName.charAt(0) + bid.mechanic.lastName.charAt(0) : 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-medium">
                                  {bid.mechanic 
                                    ? getFullName(bid.mechanic.firstName, bid.mechanic.lastName) 
                                    : 'Mechanic'}
                                </h3>
                                {bid.mechanicProfile && (
                                  <div className="flex items-center">
                                    <Rating 
                                      value={bid.mechanicProfile.rating} 
                                      count={bid.mechanicProfile.reviewCount}
                                      size="sm"
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="font-semibold text-lg text-primary-600 mr-3">
                                {formatCurrency(bid.amount)}
                              </span>
                              <Badge className={getBidStatusBadgeColor(bid.status)}>
                                {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          
                          <p className="text-neutral-700 mb-3">{bid.description}</p>
                          
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-neutral-500">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              Est. time: {bid.estimatedTime}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              Bid placed: {formatDate(bid.createdAt)}
                            </span>
                          </div>
                          
                          {isJobOwner && job.status === 'open' && bid.status === 'pending' && (
                            <div className="mt-4 flex justify-end">
                              <Button 
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => handleAcceptBid(bid.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accept Bid
                              </Button>
                            </div>
                          )}
                          
                          {isJobOwner && job.status === 'in_progress' && bid.status === 'accepted' && (
                            <div className="mt-4 flex justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => navigate(`/messages?conversation=${bid.mechanicId}&jobId=${job.id}`)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message Mechanic
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-neutral-50 rounded-md">
                      <Clock className="mx-auto h-12 w-12 text-neutral-400" />
                      <h3 className="mt-4 text-lg font-medium">No bids yet</h3>
                      <p className="mt-2 text-neutral-500">
                        This job hasn't received any bids from mechanics yet.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  {canBidOnJob && !hasBid ? (
                    <Button 
                      className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                      onClick={() => setIsBidFormOpen(true)}
                    >
                      Place a Bid
                    </Button>
                  ) : canBidOnJob && hasBid ? (
                    <p className="text-center w-full text-neutral-500">
                      You've already placed a bid on this job
                    </p>
                  ) : null}
                </CardFooter>
              </Card>
            </div>

            <div>
              {/* Job Owner Card */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5 text-primary-500" />
                    Job Posted By
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={job.user?.profilePicture} />
                      <AvatarFallback>
                        {job.user ? job.user.firstName.charAt(0) + job.user.lastName.charAt(0) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {job.user 
                          ? getFullName(job.user.firstName, job.user.lastName) 
                          : 'User'}
                      </h3>
                      <p className="text-sm text-neutral-500">
                        Member since {job.user ? formatDate(job.user.createdAt) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {!isJobOwner && !isAssignedMechanic && user?.role === 'mechanic' && (
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={job.status !== 'in_progress' || !isAuthenticated}
                      onClick={() => 
                        navigate(`/messages?conversation=${job.userId}&jobId=${job.id}`)
                      }
                    >
                      Contact Car Owner
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              {/* Actions Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isJobOwner && job.status === 'open' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/jobs/post')}
                    >
                      Edit Job
                    </Button>
                  )}
                  
                  {isJobOwner && job.status === 'in_progress' && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Mark as Completed
                    </Button>
                  )}
                  
                  {isAssignedMechanic && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/messages?conversation=${job.userId}&jobId=${job.id}`)}
                    >
                      Message Car Owner
                    </Button>
                  )}
                  
                  <Link href="/jobs">
                    <Button
                      variant="outline"
                      className="w-full"
                    >
                      View All Jobs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Accept Bid Dialog */}
      <Dialog open={isAcceptBidDialogOpen} onOpenChange={setIsAcceptBidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Accept Bid</DialogTitle>
            <DialogDescription>
              Are you sure you want to accept this bid? This will assign the mechanic to your job and notify them.
              Other bids will be automatically rejected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAcceptBidDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={confirmAcceptBid}
            >
              Accept Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobDetails;
