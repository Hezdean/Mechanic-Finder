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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Rating from "@/components/ui/rating";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Award,
  Clock,
  CheckCircle,
  Car,
  Calendar,
  MessageSquare,
  Star,
  Wrench,
  DollarSign,
  ThumbsUp,
} from "lucide-react";
import { getFullName, formatCurrency, formatDate } from "@/lib/utils";

const MechanicProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [, params] = useLocation();
  const mechanicId = parseInt(params.id);
  const [, navigate] = useLocation();

  // Fetch mechanic profile
  const {
    data: profile,
    isLoading: isLoadingProfile,
    isError: isProfileError,
  } = useQuery({
    queryKey: [`/api/mechanic-profiles/user/${mechanicId}`],
    enabled: !isNaN(mechanicId),
  });

  // Fetch mechanic's user data
  const {
    data: mechanicUser,
    isLoading: isLoadingUser,
  } = useQuery({
    queryKey: [`/api/users/${mechanicId}`],
    enabled: !isNaN(mechanicId),
  });

  // Fetch mechanic's reviews
  const {
    data: reviews,
    isLoading: isLoadingReviews,
  } = useQuery({
    queryKey: [`/api/mechanics/${mechanicId}/reviews`],
    enabled: !isNaN(mechanicId),
  });

  const isLoading = isLoadingProfile || isLoadingUser;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto animate-pulse">
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
            <div className="w-32 h-32 bg-neutral-200 rounded-full" />
            <div className="flex-1">
              <div className="h-8 bg-neutral-200 rounded w-48 mb-3" />
              <div className="h-4 bg-neutral-200 rounded w-36 mb-4" />
              <div className="h-4 bg-neutral-200 rounded w-full mb-2" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
            </div>
          </div>
          <div className="mb-8">
            <div className="h-6 bg-neutral-200 rounded w-40 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 bg-neutral-200 rounded" />
              ))}
            </div>
          </div>
          <div className="h-10 bg-neutral-200 rounded mb-6" />
          <div className="h-64 bg-neutral-200 rounded" />
        </div>
      </div>
    );
  }

  if (isProfileError || !profile || !mechanicUser) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Mechanic Not Found</h1>
        <p className="mb-8">We couldn't find the mechanic profile you're looking for.</p>
        <Link href="/mechanics">
          <Button>Browse All Mechanics</Button>
        </Link>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  // Check if current user is this mechanic
  const isSelfProfile = isAuthenticated && user?.id === mechanicId;

  return (
    <>
      <Helmet>
        <title>{`${mechanicUser.firstName} ${mechanicUser.lastName} - Mechanic Profile`}</title>
        <meta 
          name="description" 
          content={`${mechanicUser.firstName} ${mechanicUser.lastName} is a ${profile.isVerified ? 'verified' : ''} mechanic with ${profile.yearsOfExperience}+ years of experience specializing in ${profile.specializations?.join(', ')}.`} 
        />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-8">
            <Avatar className="w-32 h-32">
              <AvatarImage 
                src={mechanicUser.profilePicture} 
                alt={getFullName(mechanicUser.firstName, mechanicUser.lastName)} 
              />
              <AvatarFallback className="text-3xl bg-primary-100 text-primary-800">
                {getInitials(mechanicUser.firstName, mechanicUser.lastName)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-1">
                    {getFullName(mechanicUser.firstName, mechanicUser.lastName)}
                    {profile.isVerified && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <CheckCircle className="inline-block ml-2 h-5 w-5 text-primary-500" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Verified Mechanic</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </h1>
                  <div className="flex items-center mb-3">
                    <Rating value={profile.rating} count={profile.reviewCount} />
                  </div>
                </div>
                
                {!isSelfProfile && (
                  <div className="mt-3 sm:mt-0">
                    <Button 
                      className="bg-secondary-500 hover:bg-secondary-600 text-white"
                      onClick={() => navigate(`/messages?conversation=${mechanicId}`)}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Contact Mechanic
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.specializations?.map((spec: string, i: number) => (
                  <Badge 
                    key={i} 
                    variant="secondary"
                    className="bg-primary-100 text-primary-800 hover:bg-primary-200"
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
              
              <p className="text-neutral-600 mb-4">
                {mechanicUser.bio || `${mechanicUser.firstName} is a ${profile.isVerified ? 'verified' : ''} mechanic with ${profile.yearsOfExperience}+ years of experience.`}
              </p>
              
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-neutral-500">
                {mechanicUser.city && mechanicUser.state && (
                  <span className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    {mechanicUser.city}, {mechanicUser.state}
                  </span>
                )}
                <span className="flex items-center">
                  <Clock className="mr-1 h-4 w-4" />
                  {profile.yearsOfExperience} years of experience
                </span>
                <span className="flex items-center">
                  <DollarSign className="mr-1 h-4 w-4" />
                  {formatCurrency(profile.hourlyRate)} per hour
                </span>
                <span className="flex items-center">
                  <Car className="mr-1 h-4 w-4" />
                  {profile.isMobile ? "Mobile service available" : "Shop-based service"}
                </span>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          {/* Tabs for different sections */}
          <Tabs defaultValue="services" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="services">Services & Skills</TabsTrigger>
              <TabsTrigger value="certifications">Certifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            {/* Services & Skills Tab */}
            <TabsContent value="services">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Wrench className="mr-2 h-5 w-5 text-primary-500" />
                    Services Offered
                  </CardTitle>
                  <CardDescription>
                    Services and repairs this mechanic can perform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-lg mb-3">Services</h3>
                      <div className="space-y-2">
                        {profile.servicesOffered?.map((service: string, i: number) => (
                          <div key={i} className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>{service}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg mb-3">Specializations</h3>
                      <div className="space-y-2">
                        {profile.specializations?.map((spec: string, i: number) => (
                          <div key={i} className="flex items-center">
                            <ThumbsUp className="h-4 w-4 text-primary-500 mr-2" />
                            <span>{spec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Certifications Tab */}
            <TabsContent value="certifications">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="mr-2 h-5 w-5 text-primary-500" />
                    Certifications & Credentials
                  </CardTitle>
                  <CardDescription>
                    Professional certifications and credentials
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {profile.certifications?.length ? (
                    <div className="space-y-4">
                      {profile.certifications.map((cert: string, i: number) => (
                        <div key={i} className="p-4 border rounded-lg bg-neutral-50">
                          <div className="flex items-center">
                            <Award className="h-5 w-5 text-yellow-500 mr-2" />
                            <h3 className="font-medium">{cert}</h3>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No certifications listed</p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <h3 className="font-medium text-lg mb-3">Experience</h3>
                    <p>
                      {mechanicUser.firstName} has {profile.yearsOfExperience} years of experience working 
                      as a professional mechanic.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Reviews Tab */}
            <TabsContent value="reviews">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="mr-2 h-5 w-5 text-primary-500" />
                    Customer Reviews
                  </CardTitle>
                  <CardDescription>
                    Feedback from previous customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingReviews ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center mb-3">
                            <div className="h-10 w-10 bg-neutral-200 rounded-full mr-3" />
                            <div>
                              <div className="h-4 bg-neutral-200 rounded w-32 mb-2" />
                              <div className="h-3 bg-neutral-200 rounded w-24" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-neutral-200 rounded w-full" />
                            <div className="h-4 bg-neutral-200 rounded w-3/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : reviews?.length ? (
                    <div className="space-y-6">
                      {reviews.map((review: any) => (
                        <div key={review.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                          <div className="flex items-center mb-3">
                            <Avatar className="h-10 w-10 mr-3">
                              <AvatarImage 
                                src={review.user?.profilePicture} 
                                alt={review.user ? `${review.user.firstName} ${review.user.lastName}` : 'User'} 
                              />
                              <AvatarFallback>
                                {review.user ? review.user.firstName.charAt(0) + review.user.lastName.charAt(0) : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">
                                {review.user ? `${review.user.firstName} ${review.user.lastName}` : 'User'}
                              </h3>
                              <Rating value={review.rating * 10} showCount={false} size="sm" />
                            </div>
                            <div className="ml-auto text-sm text-neutral-500">
                              {formatDate(review.createdAt)}
                            </div>
                          </div>
                          
                          <p className="text-neutral-600">{review.comment}</p>
                          
                          {review.job && (
                            <div className="mt-3 text-sm text-neutral-500">
                              <span className="font-medium">Job:</span> {review.job.title}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No reviews yet</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {!isSelfProfile && isAuthenticated && user?.role === 'user' && (
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/jobs/post`)}>
                      <Car className="mr-2 h-4 w-4" />
                      Post a Job for {mechanicUser.firstName}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
};

export default MechanicProfile;
