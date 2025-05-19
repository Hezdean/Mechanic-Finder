import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Helmet } from "react-helmet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MechanicCard from "@/components/mechanic/MechanicCard";

const FindMechanics = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");

  // Fetch all mechanic profiles
  const { data: mechanics, isLoading } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
  });

  // Apply filters
  const filteredMechanics = mechanics ? mechanics.filter((mechanic: any) => {
    // Filter by specialization
    if (specializationFilter !== "all" && 
        !mechanic.specializations?.some((s: string) => s.toLowerCase().includes(specializationFilter.toLowerCase()))) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const userFirstName = mechanic.user?.firstName?.toLowerCase() || '';
      const userLastName = mechanic.user?.lastName?.toLowerCase() || '';
      const specializations = mechanic.specializations?.join(' ').toLowerCase() || '';
      const servicesOffered = mechanic.servicesOffered?.join(' ').toLowerCase() || '';
      
      return (
        userFirstName.includes(query) ||
        userLastName.includes(query) ||
        specializations.includes(query) ||
        servicesOffered.includes(query) ||
        mechanic.city?.toLowerCase().includes(query) ||
        mechanic.state?.toLowerCase().includes(query)
      );
    }

    return true;
  }) : [];

  // Get unique specializations for filter dropdown
  const allSpecializations = mechanics?.flatMap((mechanic: any) => 
    mechanic.specializations || []
  ).filter((value: string, index: number, self: string[]) => 
    self.indexOf(value) === index
  ) || [];

  return (
    <>
      <Helmet>
        <title>Find a Mechanic - Mechanic Finder</title>
        <meta name="description" content="Find skilled mechanics in your area. Browse by specialization, location, and ratings to find the perfect mechanic for your auto repair needs." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Find a Mechanic</h1>
            <p className="text-muted-foreground">
              Browse skilled mechanics ready to help with your vehicle repairs
            </p>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Mechanics
            </CardTitle>
            <CardDescription>
              Find mechanics based on your specific needs
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
                      <SelectItem key={spec} value={spec.toLowerCase()}>
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
                    placeholder="Search by name, skill, location..."
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
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="rounded-full bg-neutral-200 h-12 w-12 mr-3"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-neutral-200 rounded w-24"></div>
                      <div className="h-3 bg-neutral-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-full"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-1">
                    <div className="h-6 bg-neutral-200 rounded w-16"></div>
                    <div className="h-6 bg-neutral-200 rounded w-20"></div>
                    <div className="h-6 bg-neutral-200 rounded w-24"></div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-neutral-200">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-neutral-200 rounded w-1/3"></div>
                      <div className="h-8 bg-neutral-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredMechanics?.length ? (
            filteredMechanics.map((mechanic: any) => (
              <MechanicCard
                key={mechanic.id}
                id={mechanic.id}
                userId={mechanic.userId}
                firstName={mechanic.user?.firstName || ""}
                lastName={mechanic.user?.lastName || ""}
                profilePicture={mechanic.user?.profilePicture}
                city={mechanic.user?.city || ""}
                state={mechanic.user?.state || ""}
                specializations={mechanic.specializations || []}
                rating={mechanic.rating / 10}
                reviewCount={mechanic.reviewCount}
                bio={mechanic.bio || ""}
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
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default FindMechanics;