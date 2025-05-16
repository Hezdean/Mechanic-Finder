import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import MechanicCard from "@/components/mechanic/MechanicCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Search } from "lucide-react";

// Mechanic card skeleton for loading state
const SkeletonMechanicCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-6">
      <div className="flex items-center">
        <Skeleton className="h-14 w-14 rounded-full" />
        <div className="ml-4 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="mt-4 flex space-x-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-28 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-3/4" />
      <div className="mt-4 flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-28" />
      </div>
    </div>
  </div>
);

const Mechanics = () => {
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch all mechanic profiles
  const { data: mechanicProfiles, isLoading } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
    select: (data) => data
      .filter((profile: any) => profile.user && profile.isVerified)
      .map((profile: any) => ({
        ...profile,
        fullName: profile.user ? `${profile.user.firstName} ${profile.user.lastName}` : 'Unknown'
      }))
  });

  // Get unique specializations for filter dropdown
  const allSpecializations = mechanicProfiles?.flatMap((profile: any) => 
    profile.specializations || []
  ).filter((value: string, index: number, self: string[]) => 
    self.indexOf(value) === index
  ) || [];

  // Apply filters
  const filteredMechanics = mechanicProfiles?.filter((profile: any) => {
    // Filter by specialization
    if (specializationFilter !== "all" && 
        (!profile.specializations || !profile.specializations.includes(specializationFilter))) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = profile.fullName.toLowerCase();
      const bio = profile.user?.bio?.toLowerCase() || '';
      const city = profile.user?.city?.toLowerCase() || '';
      const state = profile.user?.state?.toLowerCase() || '';
      const specializations = profile.specializations?.join(' ').toLowerCase() || '';
      
      return fullName.includes(query) || 
             bio.includes(query) || 
             `${city} ${state}`.includes(query) ||
             specializations.includes(query);
    }

    return true;
  });

  return (
    <>
      <Helmet>
        <title>Find Mechanics - Same-Shit Auto Repairs</title>
        <meta name="description" content="Find qualified and verified mechanics in your area. Browse mechanics by specialization and read reviews from other car owners." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Mechanics</h1>
          <p className="text-muted-foreground">
            Browse verified mechanics with the skills to get your car back on the road
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Mechanics
            </CardTitle>
            <CardDescription>
              Find mechanics that match your specific repair needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="text-sm font-medium mb-1 block">
                  Specialization
                </label>
                <Select
                  value={specializationFilter}
                  onValueChange={setSpecializationFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specializations</SelectItem>
                    {allSpecializations.map((spec: string) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-full sm:flex-1">
                <label className="text-sm font-medium mb-1 block">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, location, specialization..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mechanics List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonMechanicCard key={i} />
            ))
          ) : filteredMechanics?.length ? (
            filteredMechanics.map((profile: any) => (
              <MechanicCard
                key={profile.id}
                id={profile.id}
                userId={profile.userId}
                firstName={profile.user.firstName}
                lastName={profile.user.lastName}
                profilePicture={profile.user.profilePicture}
                city={profile.user.city || ""}
                state={profile.user.state || ""}
                specializations={profile.specializations || []}
                rating={profile.rating}
                reviewCount={profile.reviewCount}
                bio={profile.user.bio || `${profile.user.firstName} is a verified mechanic with ${profile.yearsOfExperience}+ years of experience.`}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-neutral-700">No mechanics found</h3>
              <p className="mt-2 text-neutral-500 max-w-md mx-auto">
                {searchQuery || specializationFilter !== "all"
                  ? "No mechanics match your search criteria. Try adjusting your filters or search query."
                  : "There are no verified mechanics available at the moment. Check back soon!"}
              </p>
              <Link href="/">
                <Button className="mt-6 bg-primary-500 hover:bg-primary-600">
                  Back to Home
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Mechanics;
