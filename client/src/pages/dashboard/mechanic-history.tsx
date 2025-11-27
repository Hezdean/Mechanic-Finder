import { useQuery } from "@tanstack/react-query";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Wrench,
  DollarSign,
  Star,
  Calendar
} from "lucide-react";
import { Link } from "wouter";

const MechanicHistory = () => {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  if (!user || user.role !== "mechanic") {
    navigate("/");
    return null;
  }

  const { data: myBids, isLoading: isLoadingBids } = useQuery({
    queryKey: ['/api/mechanic/bids'],
    enabled: !!user.id,
  });

  const { data: myBidsWithJobs, isLoading: isLoadingBidsWithJobs } = useQuery({
    queryKey: ['/api/mechanic/bids', 'with-jobs-history'],
    queryFn: async () => {
      if (!myBids || !Array.isArray(myBids) || !myBids.length) return [];
      
      const bidsWithJobs = await Promise.all(
        myBids.map(async (bid: any) => {
          try {
            const jobResponse = await fetch(`/api/jobs/${bid.jobId}`, {
              credentials: 'include'
            });
            
            if (!jobResponse.ok) return { ...bid, job: null };
            
            const job = await jobResponse.json();
            return { ...bid, job };
          } catch (error) {
            return { ...bid, job: null };
          }
        })
      );
      
      return bidsWithJobs.filter(bid => bid.job !== null);
    },
    enabled: !!myBids && Array.isArray(myBids) && myBids.length > 0,
  });

  const completedJobs = Array.isArray(myBidsWithJobs) 
    ? myBidsWithJobs.filter((bid: any) => 
        bid.status === 'accepted' && bid.job?.status === 'completed'
      )
    : [];

  const inProgressJobs = Array.isArray(myBidsWithJobs) 
    ? myBidsWithJobs.filter((bid: any) => 
        bid.status === 'accepted' && bid.job?.status === 'in_progress'
      )
    : [];

  const allAcceptedBids = Array.isArray(myBidsWithJobs) 
    ? myBidsWithJobs.filter((bid: any) => bid.status === 'accepted')
    : [];

  const totalEarnings = completedJobs.reduce((sum: number, bid: any) => sum + (bid.amount || 0), 0);

  const isLoading = isLoadingBids || isLoadingBidsWithJobs;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800" data-testid="badge-completed">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800" data-testid="badge-in-progress">In Progress</Badge>;
      case 'open':
        return <Badge className="bg-yellow-100 text-yellow-800" data-testid="badge-open">Open</Badge>;
      default:
        return <Badge variant="secondary" data-testid="badge-default">{status}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Job History - Mechanic Dashboard</title>
        <meta name="description" content="View your completed jobs, earnings, and work history as a mechanic." />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard/mechanic">
            <Button variant="ghost" className="mb-4" data-testid="button-back">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">Job History</h1>
          <p className="text-muted-foreground">View your completed work and earnings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-jobs">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-3xl font-bold" data-testid="text-total-jobs">{allAcceptedBids.length}</p>
                </div>
                <Wrench className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-completed">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-3xl font-bold text-green-600" data-testid="text-completed">{completedJobs.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-in-progress">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-3xl font-bold text-blue-600" data-testid="text-in-progress">{inProgressJobs.length}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-earnings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary" data-testid="text-earnings">{formatCurrency(totalEarnings)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="card-job-history">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Work History
            </CardTitle>
            <CardDescription>
              All your accepted jobs and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8" data-testid="loading-indicator">
                <p className="text-muted-foreground">Loading your job history...</p>
              </div>
            ) : allAcceptedBids.length === 0 ? (
              <div className="text-center py-12" data-testid="empty-state">
                <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No jobs yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't completed any jobs yet. Start bidding on available jobs to build your history.
                </p>
                <Link href="/jobs">
                  <Button data-testid="button-browse-jobs">Browse Available Jobs</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAcceptedBids.map((bid: any) => (
                      <TableRow key={bid.id} data-testid={`row-job-${bid.id}`}>
                        <TableCell className="font-medium">
                          <Link href={`/jobs/${bid.jobId}`}>
                            <span className="text-primary hover:underline cursor-pointer" data-testid={`link-job-${bid.id}`}>
                              {bid.job?.title || `Job #${bid.jobId}`}
                            </span>
                          </Link>
                        </TableCell>
                        <TableCell data-testid={`text-vehicle-${bid.id}`}>{bid.job?.vehicle || 'N/A'}</TableCell>
                        <TableCell data-testid={`text-location-${bid.id}`}>{bid.job?.location || 'N/A'}</TableCell>
                        <TableCell data-testid={`text-amount-${bid.id}`}>{formatCurrency(bid.amount)}</TableCell>
                        <TableCell>{getStatusBadge(bid.job?.status || 'unknown')}</TableCell>
                        <TableCell data-testid={`text-date-${bid.id}`}>{formatDate(bid.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {completedJobs.length > 0 && (
          <Card className="mt-8" data-testid="card-reviews">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="mr-2 h-5 w-5 text-yellow-500" />
                Customer Reviews
              </CardTitle>
              <CardDescription>
                Feedback from your completed jobs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Star className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p>Reviews from customers will appear here after job completion.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default MechanicHistory;
