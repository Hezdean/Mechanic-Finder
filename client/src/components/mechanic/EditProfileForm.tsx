import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const profileSchema = z.object({
  bio: z.string().optional(),
  specializations: z.string().min(1, { message: "Please provide at least one specialization" }),
  servicesOffered: z.string().min(1, { message: "Please provide at least one service" }),
  certifications: z.string().optional(),
  yearsOfExperience: z.coerce.number().min(0, { message: "Must be a positive number" }),
  hourlyRate: z.coerce.number().min(0, { message: "Must be a positive number" }),
  isMobile: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileFormProps {
  profile: any;
  onSuccess?: () => void;
}

export function EditProfileForm({ profile, onSuccess }: EditProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Convert array fields to comma-separated strings for the form
  const defaultValues: Partial<ProfileFormValues> = {
    bio: profile?.bio || "",
    specializations: profile?.specializations ? profile.specializations.join(", ") : "",
    servicesOffered: profile?.servicesOffered ? profile.servicesOffered.join(", ") : "",
    certifications: profile?.certifications ? profile.certifications.join(", ") : "",
    yearsOfExperience: profile?.yearsOfExperience || 0,
    hourlyRate: profile?.hourlyRate || 0,
    isMobile: profile?.isMobile || false,
  };

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) => {
      // Convert comma-separated strings back to arrays for the API
      const formattedData = {
        ...data,
        specializations: data.specializations.split(",").map(s => s.trim()).filter(s => s),
        servicesOffered: data.servicesOffered.split(",").map(s => s.trim()).filter(s => s),
        certifications: data.certifications ? data.certifications.split(",").map(s => s.trim()).filter(s => s) : [],
      };
      return apiRequest(`/api/mechanic-profiles/${profile.id}`, "PATCH", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mechanic-profiles"] });
      queryClient.invalidateQueries({ queryKey: [`/api/mechanic-profiles/user/${profile.userId}`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      if (onSuccess) onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsSubmitting(true);
    updateProfileMutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell customers about yourself, your experience, and your approach to auto repair..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A professional bio helps customers know who they're hiring
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="yearsOfExperience"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Years of Experience</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (MK)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isMobile"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Mobile Service Available</FormLabel>
                <FormDescription>
                  Check this if you offer on-site repairs at the customer's location
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <Separator />

        <FormField
          control={form.control}
          name="specializations"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Specializations</FormLabel>
              <FormControl>
                <Input
                  placeholder="Engine Repair, Brake Systems, Electrical Systems, etc."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter specializations separated by commas (e.g., Engine Repair, Brake Systems)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="servicesOffered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Services Offered</FormLabel>
              <FormControl>
                <Input
                  placeholder="Oil Change, Tire Rotation, Brake Repair, etc."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter services separated by commas (e.g., Oil Change, Tire Rotation)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="certifications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Certifications (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="LTC Master Technician, TEVET Certified, etc."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter certifications separated by commas
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block mr-2">⟳</span>
                Updating...
              </>
            ) : "Update Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}