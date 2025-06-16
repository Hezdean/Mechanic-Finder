import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateTransactionReceipt } from "@/lib/invoiceGenerator";
import { CreditCard, Smartphone, Banknote, Download } from "lucide-react";

const paymentFormSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
  paymentMethod: z.enum(["cash", "mobile_money"]),
  transactionReference: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentFormProps {
  jobId: number;
  bidAmount: number;
  mechanicName: string;
  onSuccess?: () => void;
}

export function PaymentForm({ jobId, bidAmount, mechanicName, onSuccess }: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastTransactionData, setLastTransactionData] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: bidAmount,
      paymentMethod: "cash",
      transactionReference: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      return apiRequest("/api/transactions", "POST", {
        jobId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        transactionReference: data.transactionReference || null,
      });
    },
    onSuccess: async (transactionData) => {
      setLastTransactionData(transactionData);
      
      toast({
        title: "Payment Initiated",
        description: "Your payment has been processed successfully. Generating receipt...",
      });
      
      // Fetch job details with user and mechanic information for the invoice
      try {
        const response = await fetch(`/api/jobs/${jobId}`);
        const jobData = await response.json();
        const acceptedBid = jobData.bids?.find((bid: any) => bid.status === 'accepted');
        
        if (acceptedBid && acceptedBid.mechanic) {
          // Generate and download PDF receipt
          generateTransactionReceipt(transactionData, jobData, acceptedBid.mechanic);
          
          toast({
            title: "Receipt Downloaded",
            description: "Your payment receipt has been downloaded automatically.",
          });
        }
      } catch (error) {
        console.error("Failed to generate receipt:", error);
        toast({
          title: "Receipt Generation Failed",
          description: "Payment successful, but receipt generation failed. You can request a receipt later.",
          variant: "destructive",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/jobs", jobId] });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      await createPaymentMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = async () => {
    if (!lastTransactionData) {
      toast({
        title: "No Receipt Available",
        description: "Complete a payment first to generate a receipt.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const jobData = await response.json();
      const acceptedBid = jobData.bids?.find((bid: any) => bid.status === 'accepted');
      
      if (acceptedBid && acceptedBid.mechanic) {
        generateTransactionReceipt(lastTransactionData, jobData, acceptedBid.mechanic);
        
        toast({
          title: "Receipt Downloaded",
          description: "Your payment receipt has been downloaded successfully.",
        });
      } else {
        toast({
          title: "Download Failed",
          description: "Unable to find job details for receipt generation.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download receipt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const selectedPaymentMethod = form.watch("paymentMethod");

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment for Repair Service
        </CardTitle>
        <CardDescription>
          Pay {mechanicName} for the accepted repair job
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (MK)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Method</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                          <Banknote className="h-4 w-4" />
                          Cash Payment
                        </div>
                      </SelectItem>
                      <SelectItem value="mobile_money">
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4" />
                          Mobile Money
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedPaymentMethod === "mobile_money" && (
              <FormField
                control={form.control}
                name="transactionReference"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Transaction Reference (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., TNM123456789"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="pt-4 space-y-2">
              <div className="text-sm text-muted-foreground">
                <p><strong>Payment Summary:</strong></p>
                <p>Amount: MK {bidAmount.toLocaleString()}</p>
                <p>Method: {selectedPaymentMethod === "cash" ? "Cash Payment" : "Mobile Money"}</p>
                <p>Recipient: {mechanicName}</p>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || createPaymentMutation.isPending}
              >
                {isSubmitting || createPaymentMutation.isPending ? "Processing..." : "Make Payment"}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleDownloadReceipt}
                disabled={!createPaymentMutation.isSuccess}
              >
                <Download className="mr-2 h-4 w-4" />
                Download Receipt
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}