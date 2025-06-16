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
import { CreditCard, Smartphone, Banknote } from "lucide-react";

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
      const response = await apiRequest("/api/transactions", {
        method: "POST",
        body: JSON.stringify({
          jobId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          transactionReference: data.transactionReference || null,
        }),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Initiated",
        description: "Your payment has been processed successfully.",
      });
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

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || createPaymentMutation.isPending}
            >
              {isSubmitting || createPaymentMutation.isPending ? "Processing..." : "Make Payment"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}