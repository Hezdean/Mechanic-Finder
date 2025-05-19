import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import JobCard from "@/components/job/JobCard";
import { PlusCircle, Filter, Search } from "lucide-react";

const Jobs = () => {
  const { user, isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch all jobs
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs'],
  });
  
  // Fetch mechanic's existing bids if user is a mechanic
  const { data: mechanicBids } = useQuery({
    queryKey: ['/api/bids/mechanic'],
    enabled: isAuthenticated && user?.role === 'mechanic',
  });

  // Apply filters
  const filteredJobs = jobs?.filter((job: any) => {
    // Filter by status
    if (statusFilter !== "all" && job.status !== statusFilter) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.description.toLowerCase().includes(query) ||
        job.vehicle.toLowerCase().includes(query) ||
        job.location.toLowerCase().includes(query)
      );
    }

    return true;
  });

  return (
    <>
      <Helmet>
        <title>Browse Repair Jobs - Mechanic Finder</title>
        <meta name="description" content="Find auto repair jobs that match your skills. Browse all open repair requests or filter by location and vehicle type." />
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Repair Jobs</h1>
            <p className="text-muted-foreground">
              Browse all available auto repair jobs
            </p>
          </div>
          {isAuthenticated && user?.role === "user" && (
            <Link href="/jobs/post">
              <Button className="mt-4 sm:mt-0 bg-secondary-500 hover:bg-secondary-600">
                <PlusCircle className="mr-2 h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filter Jobs
            </CardTitle>
            <CardDescription>
              Narrow down the repair jobs based on your preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/3">
                <label className="text-sm font-medium mb-1 block">
                  Job Status
                </label>
                <Select
                  value={statusFilter}
                  onValueChange={setStatusFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                    placeholder="Search by title, description, vehicle..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading state
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="h-6 bg-neutral-200 rounded w-3/4"></div>
                    <div className="h-6 bg-neutral-200 rounded w-16"></div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-neutral-200 rounded w-full"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
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
          ) : filteredJobs?.length ? (
            filteredJobs.map((job: any) => (
              <JobCard
                key={job.id}
                id={job.id}
                title={job.title}
                vehicle={job.vehicle}
                location={job.location}
                status={job.status}
                description={job.description}
                createdAt={job.createdAt}
                bidCount={job.bidCount || 0}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium text-neutral-700">No jobs found</h3>
              <p className="mt-2 text-neutral-500 max-w-md mx-auto">
                {searchQuery
                  ? "No jobs match your search criteria. Try adjusting your filters or search query."
                  : "There are no jobs available at the moment. Check back soon!"}
              </p>
              {isAuthenticated && user?.role === "user" && (
                <Link href="/jobs/post">
                  <Button className="mt-6 bg-secondary-500 hover:bg-secondary-600">
                    Post a New Job
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Jobs;
