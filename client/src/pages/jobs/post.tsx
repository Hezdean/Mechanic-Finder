import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Car, MapPin, DollarSign, FileText, Images } from "lucide-react";

// Form schema
const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must not exceed 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(1000, "Description must not exceed 1000 characters"),
  vehicle: z.string().min(5, "Vehicle details must be at least 5 characters").max(100, "Vehicle details must not exceed 100 characters"),
  location: z.string().min(3, "Location must be at least 3 characters").max(100, "Location must not exceed 100 characters"),
  budget: z.string().optional(),
  photos: z.any().optional(), // This would be handled differently in a real app
});

type FormValues = z.infer<typeof formSchema>;

const PostJob = () => {
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated or not a car owner
  if (!isAuthenticated) {
    navigate("/login");
    return null;
  }

  if (user?.role !== "user") {
    navigate("/");
    return null;
  }

  // Setup form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      vehicle: "",
      location: "",
      budget: "",
      photos: undefined,
    },
  });

  // Create job mutation
  const createJobMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/jobs', data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/jobs'] });
      toast({
        title: "Job posted successfully",
        description: "Mechanics will now be able to view your job and place bids.",
      });
      navigate(`/jobs/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error posting job",
        description: error.message || "An error occurred while posting your job. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = (data: FormValues) => {
    setIsSubmitting(true);

    // Process the form data
    const jobData = {
      userId: user!.id,
      title: data.title,
      description: data.description,
      vehicle: data.vehicle,
      location: data.location,
      budget: data.budget ? parseInt(data.budget) : undefined,
      photos: [], // In a real app, we'd handle photo uploads
    };

    createJobMutation.mutate(jobData);
  };

  return (
    <>
      <Helmet>
        <title>Post a Repair Job - Same-Shit Auto Repairs</title>
        <meta name="description" content="Post your vehicle repair needs and receive bids from qualified mechanics in your area." />
      </Helmet>
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Post a Repair Job</h1>
          <p className="text-muted-foreground">
            Describe your vehicle issue to receive bids from qualified mechanics
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Provide as much detail as possible to help mechanics understand your needs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary-500" />
                        Job Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Brake Pad Replacement, Engine Misfire Diagnosis"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        A clear title will help mechanics understand your main issue
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-primary-500" />
                        Job Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the issue in detail. When did it start? What symptoms are you experiencing? Include any relevant information that would help a mechanic diagnose the problem."
                          className="min-h-[150px]"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        A detailed description helps mechanics provide accurate bids
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="vehicle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Car className="mr-2 h-4 w-4 text-primary-500" />
                        Vehicle Details
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 2018 Toyota Camry, 45K miles"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        Include year, make, model, and mileage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MapPin className="mr-2 h-4 w-4 text-primary-500" />
                        Your Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Seattle, WA"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        City and state where the vehicle is located
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4 text-primary-500" />
                        Budget (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Your budget for this repair (in USD)"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        An approximate budget helps mechanics tailor their bids
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* In a real app, we'd have photo uploads here */}
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Images className="mr-2 h-4 w-4 text-primary-500" />
                    Photos (Optional)
                  </FormLabel>
                  <FormDescription className="mb-2">
                    Upload photos of the issue to help mechanics better understand the problem
                  </FormDescription>
                  <div className="border-2 border-dashed rounded-md p-8 text-center border-neutral-200">
                    <p className="text-sm text-neutral-500">
                      Photo upload is not available in this demo version
                    </p>
                  </div>
                </FormItem>

                <Button 
                  type="submit" 
                  className="w-full bg-secondary-500 hover:bg-secondary-600"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Posting Job...
                    </>
                  ) : (
                    "Post Job"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PostJob;
