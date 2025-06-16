import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

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
import { Button } from "@/components/ui/button";

const bidFormSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: "Amount must be a number" })
    .min(1, "Amount must be at least 1"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  estimatedTime: z.string().min(1, "Estimated time is required"),
});

type BidFormValues = z.infer<typeof bidFormSchema>;

interface BidFormProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  mechanicId: number;
}

const BidForm = ({ isOpen, onClose, jobId, mechanicId }: BidFormProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BidFormValues>({
    resolver: zodResolver(bidFormSchema),
    defaultValues: {
      amount: undefined,
      description: "",
      estimatedTime: "",
    },
  });

  const placeBidMutation = useMutation({
    mutationFn: (data: BidFormValues & { jobId: number; mechanicId: number }) =>
      apiRequest("/api/bids", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/jobs/${jobId}`] });
      toast({
        title: "Bid placed successfully",
        description: "Your bid has been submitted to the job owner.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error placing bid",
        description: error.message || "An error occurred while placing your bid. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: BidFormValues) => {
    setIsSubmitting(true);
    placeBidMutation.mutate({
      ...data,
      jobId,
      mechanicId,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Place a Bid</DialogTitle>
          <DialogDescription>
            Submit your bid for this repair job. Provide a clear description of how you'll address the issue.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bid Amount ($)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your bid amount"
                      type="number"
                      min="1"
                      step="0.01"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="estimatedTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Time</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 2-3 hours, 1-2 days"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description of Work</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how you'll approach this repair, the parts needed, and your experience with similar issues."
                      className="min-h-[120px]"
                      {...field}
                      disabled={isSubmitting}
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
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Bid"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default BidForm;