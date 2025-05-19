import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar,
  MessageSquare, 
  MapPin, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Award, 
  Tool,
  Car,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Rating from "@/components/ui/rating";

const MechanicProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useLocation();
  const mechanicId = parseInt(params.id);
  const [, navigate] = useLocation();

  // Fetch mechanic profile details
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [`/api/mechanic-profiles/${mechanicId}`],
    enabled: !isNaN(mechanicId),
  });

  // Check if user is the profile owner
  const isProfileOwner = user?.id === profile?.userId;

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

  if (isError || !profile) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Mechanic Profile</h1>
        <p className="mb-8">We couldn't find the mechanic you're looking for. They may have been removed or don't exist.</p>
        <Link href="/mechanics">
          <Button>Browse All Mechanics</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${profile.user?.firstName} ${profile.user?.lastName} - Mechanic Finder`}</title>
        <meta name="description" content={`Hire ${profile.user?.firstName} ${profile.user?.lastName}, a professional mechanic specializing in ${profile.specializations?.join(', ')}.`} />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        {/* Mechanic Profile Header */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-8">
              <div className="flex flex-col md:flex-row md:items-center">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 mr-6">
                  <AvatarImage src={profile.user?.profilePicture} />
                  <AvatarFallback className="text-2xl">
                    {profile.user ? profile.user.firstName.charAt(0) + profile.user.lastName.charAt(0) : 'M'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="mt-4 md:mt-0 flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold">
                        {profile.user?.firstName} {profile.user?.lastName}
                      </h1>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 text-neutral-500 mr-1" />
                        <p className="text-neutral-500">
                          {profile.user?.city}, {profile.user?.state}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col items-start md:items-end">
                      <div className="flex items-center">
                        <Rating value={profile.rating / 10} count={profile.reviewCount} />
                      </div>
                      <p className="text-neutral-500 mt-1">
                        {profile.reviewCount} reviews
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.specializations?.map((spec, index) => (
                      <Badge key={index} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  
                  {!isProfileOwner && isAuthenticated && user?.role === "user" && (
                    <div className="mt-4 space-x-3">
                      <Button 
                        className="bg-accent hover:bg-accent/90"
                        onClick={() => navigate(`/messages?conversation=${profile.userId}`)}
                      >
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Contact Mechanic
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/jobs/post?mechanic=${profile.userId}`)}
                      >
                        <Car className="mr-2 h-4 w-4" />
                        Request Quote
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mechanic Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-700 whitespace-pre-line">
                    {profile.bio || `${profile.user?.firstName} is a professional mechanic with ${profile.yearsOfExperience} years of experience, specializing in ${profile.specializations?.join(', ')}.`}
                  </p>
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-3">Services Offered</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.servicesOffered?.map((service, index) => (
                        <div key={index} className="flex items-center">
                          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                          <span>{service}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile.reviewCount > 0 ? (
                    <div>
                      {/* Reviews would be rendered here */}
                      <p className="text-neutral-500">Reviews coming soon...</p>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-neutral-50 rounded-md">
                      <p className="text-neutral-500">
                        No reviews yet. Be the first to leave a review!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 text-neutral-400 mr-2" />
                      <span>Experience</span>
                    </div>
                    <span className="font-medium">{profile.yearsOfExperience} years</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-neutral-400 mr-2" />
                      <span>Hourly Rate</span>
                    </div>
                    <span className="font-medium">{formatCurrency(profile.hourlyRate)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-neutral-400 mr-2" />
                      <span>Mobile Service</span>
                    </div>
                    <span className="font-medium">{profile.isMobile ? "Yes" : "No"}</span>
                  </div>
                </CardContent>
              </Card>
              
              {profile.certifications && profile.certifications.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Award className="h-5 w-5 text-primary-500 mr-2" />
                      Certifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {profile.certifications.map((cert, index) => (
                        <li key={index} className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span>{cert}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MechanicProfile;