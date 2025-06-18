import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/job/JobCard";
import { SkeletonJobCard } from "@/components/ui/skeleton-job-card";
import { useAuth } from "@/hooks/use-auth";


const RecentJobs = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs?limit=3'],
    select: (data) => data?.filter(job => job.status === 'open' || job.status === 'in_progress').slice(0, 3)
  });
  
  // Fetch mechanic's existing bids if user is a mechanic
  const { data: mechanicBids = [] } = useQuery({
    queryKey: ['/api/mechanic/bids'],
    enabled: isAuthenticated && user?.role === 'mechanic',
  });

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">Recent Repair Jobs</h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-2xl mx-auto">Browse recently posted jobs in need of skilled mechanics</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <SkeletonJobCard />
              <SkeletonJobCard />
              <SkeletonJobCard />
            </>
          ) : jobs?.length ? (
            jobs.map((job) => (
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
                isAuthenticated={isAuthenticated}
                userRole={user?.role}
                userId={user?.id}
                hasBid={mechanicBids?.some((bid: any) => bid.jobId === job.id)}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-neutral-500">No open jobs found. Be the first to post a repair job!</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/jobs">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">
              Browse All Jobs <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentJobs;
