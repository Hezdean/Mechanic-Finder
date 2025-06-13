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
  const [location] = useLocation();
  const jobId = parseInt(location.split('/').pop() || '0');
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
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Received Bids ({job.bids?.length || 0})</CardTitle>
                      <CardDescription>
                        {job.status === 'open' 
                          ? isJobOwner 
                            ? "Compare bids and choose the best mechanic for your job"
                            : "Mechanics who have placed bids on this job" 
                          : job.status === 'in_progress'
                          ? "This job has been assigned to a mechanic"
                          : "This job has been completed"
                        }
                      </CardDescription>
                    </div>
                    {isJobOwner && job.bids?.length > 0 && job.status === 'open' && (
                      <div className="text-sm text-muted-foreground">
                        <p>Lowest: {formatCurrency(Math.min(...job.bids.map((b: any) => b.amount)))}</p>
                        <p>Highest: {formatCurrency(Math.max(...job.bids.map((b: any) => b.amount)))}</p>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {job.bids?.length > 0 ? (
                    <div className="space-y-4">
                      {/* Sort bids by amount for job owners */}
                      {[...job.bids]
                        .sort((a: any, b: any) => isJobOwner ? a.amount - b.amount : 0)
                        .map((bid: any, index: number) => (
                        <div 
                          key={bid.id} 
                          className={`border rounded-lg p-5 transition-all hover:shadow-md ${
                            bid.status === 'accepted' 
                              ? 'border-green-300 bg-green-50 shadow-md' 
                              : 'border-gray-200 hover:border-primary/30'
                          } ${isJobOwner && job.status === 'open' ? 'cursor-pointer' : ''}`}
                        >
                          {/* Best Value Badge for lowest bid */}
                          {isJobOwner && job.status === 'open' && index === 0 && job.bids.length > 1 && (
                            <div className="mb-3">
                              <Badge className="bg-accent text-white">
                                Best Value
                              </Badge>
                            </div>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4">
                            <div className="flex items-start mb-3 sm:mb-0 flex-1">
                              <Avatar className="h-12 w-12 mr-4">
                                <AvatarImage src={bid.mechanic?.profilePicture} />
                                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                  {bid.mechanic ? bid.mechanic.firstName.charAt(0) + bid.mechanic.lastName.charAt(0) : 'M'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <h3 className="font-semibold text-lg mr-2">
                                    {bid.mechanic 
                                      ? getFullName(bid.mechanic.firstName, bid.mechanic.lastName) 
                                      : 'Mechanic'}
                                  </h3>
                                  <Link href={`/mechanics/${bid.mechanicProfile?.id}`}>
                                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 p-0 h-auto">
                                      View Profile
                                    </Button>
                                  </Link>
                                </div>
                                {bid.mechanicProfile && (
                                  <div className="flex items-center mb-2">
                                    <Rating 
                                      value={bid.mechanicProfile.rating} 
                                      count={bid.mechanicProfile.reviewCount}
                                      size="sm"
                                    />
                                    <span className="ml-2 text-sm text-muted-foreground">
                                      {bid.mechanicProfile.yearsOfExperience} years experience
                                    </span>
                                  </div>
                                )}
                                {bid.mechanicProfile?.specializations && (
                                  <div className="flex flex-wrap gap-1">
                                    {bid.mechanicProfile.specializations.slice(0, 3).map((spec: string, i: number) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {spec}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-right">
                              <div className="flex items-center justify-end mb-2">
                                <span className="font-bold text-2xl text-primary mr-2">
                                  {formatCurrency(bid.amount)}
                                </span>
                                <Badge className={getBidStatusBadgeColor(bid.status)}>
                                  {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                                </Badge>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Est. {bid.estimatedTime}
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-neutral-50 rounded-md p-3 mb-4">
                            <p className="text-sm font-medium text-neutral-700 mb-1">Proposal:</p>
                            <p className="text-neutral-700">{bid.description}</p>
                          </div>
                          
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground mb-4">
                            <span className="flex items-center">
                              <Clock className="mr-1 h-4 w-4" />
                              Estimated completion: {bid.estimatedTime}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="mr-1 h-4 w-4" />
                              Bid submitted: {formatDate(bid.createdAt)}
                            </span>
                            {bid.mechanicProfile?.isMobile && (
                              <span className="flex items-center text-green-600">
                                <Car className="mr-1 h-4 w-4" />
                                Mobile service available
                              </span>
                            )}
                          </div>
                          
                          {/* Action buttons for job owner */}
                          {isJobOwner && job.status === 'open' && bid.status === 'pending' && (
                            <div className="flex gap-3 justify-end">
                              <Button 
                                variant="outline"
                                onClick={() => navigate(`/messages?conversation=${bid.mechanicId}&jobId=${job.id}`)}
                              >
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Message First
                              </Button>
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white px-6"
                                onClick={() => handleAcceptBid(bid.id)}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Accept This Bid
                              </Button>
                            </div>
                          )}
                          
                          {/* Message button for accepted bid */}
                          {isJobOwner && job.status === 'in_progress' && bid.status === 'accepted' && (
                            <div className="flex justify-between items-center bg-green-100 rounded-md p-3">
                              <div className="text-green-800 font-medium">
                                ✓ This bid has been accepted
                              </div>
                              <Button 
                                className="bg-green-600 hover:bg-green-700 text-white"
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
                    <div className="text-center py-12 bg-neutral-50 rounded-md">
                      <Clock className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                      <h3 className="text-xl font-semibold mb-2">No bids received yet</h3>
                      <p className="text-muted-foreground mb-4">
                        {isJobOwner 
                          ? "Your job is live and mechanics can see it. Bids will appear here as they come in."
                          : "This job hasn't received any bids from mechanics yet."
                        }
                      </p>
                      {isJobOwner && (
                        <div className="text-sm text-muted-foreground">
                          <p>💡 Tip: Jobs with detailed descriptions and photos typically receive more bids</p>
                        </div>
                      )}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirm Bid Acceptance</DialogTitle>
            <DialogDescription>
              You're about to accept this bid and assign the mechanic to your job.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBidId && (
            <div className="py-4">
              {(() => {
                const selectedBid = job?.bids?.find((bid: any) => bid.id === selectedBidId);
                if (!selectedBid) return null;
                
                return (
                  <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={selectedBid.mechanic?.profilePicture} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {selectedBid.mechanic ? selectedBid.mechanic.firstName.charAt(0) + selectedBid.mechanic.lastName.charAt(0) : 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">
                          {selectedBid.mechanic 
                            ? getFullName(selectedBid.mechanic.firstName, selectedBid.mechanic.lastName) 
                            : 'Mechanic'}
                        </h4>
                        {selectedBid.mechanicProfile && (
                          <div className="flex items-center">
                            <Rating 
                              value={selectedBid.mechanicProfile.rating} 
                              count={selectedBid.mechanicProfile.reviewCount}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Price:</span>
                        <p className="font-bold text-lg text-primary">{formatCurrency(selectedBid.amount)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Time:</span>
                        <p className="font-medium">{selectedBid.estimatedTime}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">What happens next:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The mechanic will be notified of your acceptance</li>
                  <li>• Other bids will be automatically rejected</li>
                  <li>• Your job status will change to "In Progress"</li>
                  <li>• You can message the mechanic to coordinate details</li>
                </ul>
              </div>
            </div>
          )}
          
          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsAcceptBidDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              onClick={confirmAcceptBid}
              disabled={acceptBidMutation.isPending}
            >
              {acceptBidMutation.isPending ? "Accepting..." : "Accept Bid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobDetails;
