import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Download, Calendar, DollarSign, User, Wrench, Car } from "lucide-react";
import { format } from "date-fns";
import { generateTransactionReceipt } from "@/lib/invoiceGenerator";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: number;
  jobId: number;
  userId: number;
  mechanicId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionReference: string | null;
  createdAt: string;
  updatedAt: string;
  job?: {
    title: string;
    description: string;
    vehicle: string;
    location: string;
    status: string;
    user?: {
      firstName: string;
      lastName: string;
      username: string;
    };
  };
  mechanic?: {
    firstName: string;
    lastName: string;
    username: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    username: string;
  };
}

export default function TransactionHistory() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['/api/transactions'],
    enabled: !!user,
  });

  const { data: mechanicEarnings } = useQuery({
    queryKey: ['/api/transactions/earnings'],
    enabled: !!user && user.role === 'mechanic',
  });

  const handleDownloadReceipt = async (transaction: Transaction) => {
    if (!transaction.job) {
      toast({
        title: "Error",
        description: "Job details not available for receipt generation.",
        variant: "destructive",
      });
      return;
    }

    try {
      const mechanicInfo = transaction.mechanic || {
        firstName: "Unknown",
        lastName: "Mechanic",
        username: "unknown"
      };

      generateTransactionReceipt(transaction, transaction.job, mechanicInfo);
      
      toast({
        title: "Receipt Downloaded",
        description: "Your transaction receipt has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Failed to generate receipt:", error);
      toast({
        title: "Download Failed",
        description: "Failed to generate receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const isCarOwner = user?.role === 'user';
  const isMechanic = user?.role === 'mechanic';

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaction History</h1>
          <p className="text-muted-foreground">
            {isCarOwner && "View your payment history and download receipts"}
            {isMechanic && "Track your earnings and completed jobs"}
          </p>
        </div>
      </div>

      {isMechanic && mechanicEarnings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Earnings Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  MK {mechanicEarnings.totalEarnings?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Total Earned</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {mechanicEarnings.completedJobs || 0}
                </div>
                <div className="text-sm text-muted-foreground">Jobs Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  MK {mechanicEarnings.averageJobValue?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-muted-foreground">Average Job Value</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-center space-y-2">
                <div className="text-muted-foreground">
                  {isCarOwner && "No payment history found."}
                  {isMechanic && "No completed jobs with payments yet."}
                </div>
                <p className="text-sm text-muted-foreground">
                  {isCarOwner && "Complete a payment to see your transaction history here."}
                  {isMechanic && "Once jobs are completed and paid, they'll appear here."}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          transactions.map((transaction: Transaction) => (
            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      {isCarOwner && <Car className="h-4 w-4" />}
                      {isMechanic && <Wrench className="h-4 w-4" />}
                      {transaction.job?.title || `Job #${transaction.jobId}`}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(transaction.createdAt), 'MMM dd, yyyy')}
                      </span>
                      <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                        {transaction.status}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      MK {transaction.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {transaction.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Job Details</h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="font-medium">Vehicle:</span> {transaction.job?.vehicle}</p>
                        <p><span className="font-medium">Location:</span> {transaction.job?.location}</p>
                        {transaction.job?.description && (
                          <p><span className="font-medium">Description:</span> {transaction.job.description}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">
                        {isCarOwner ? "Mechanic" : "Customer"} Information
                      </h4>
                      <div className="space-y-1 text-sm">
                        {isCarOwner && transaction.mechanic && (
                          <>
                            <p className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {transaction.mechanic.firstName} {transaction.mechanic.lastName}
                            </p>
                            <p className="text-muted-foreground">@{transaction.mechanic.username}</p>
                          </>
                        )}
                        {isMechanic && transaction.user && (
                          <>
                            <p className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {transaction.user.firstName} {transaction.user.lastName}
                            </p>
                            <p className="text-muted-foreground">@{transaction.user.username}</p>
                          </>
                        )}
                        {transaction.transactionReference && (
                          <p><span className="font-medium">Ref:</span> {transaction.transactionReference}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Transaction #{transaction.id} • Last updated {format(new Date(transaction.updatedAt), 'MMM dd, yyyy HH:mm')}
                    </div>
                    {isCarOwner && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadReceipt(transaction)}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}