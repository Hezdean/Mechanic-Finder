import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/job/JobCard";
import { Skeleton } from "@/components/ui/skeleton";

const SkeletonJobCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <div className="p-6">
      <div className="flex justify-between items-start">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <div className="mt-2 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>
      <Skeleton className="mt-4 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <div className="mt-4 pt-4 border-t border-neutral-200">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  </div>
);

const RecentJobs = () => {
  const { data: jobs, isLoading } = useQuery({
    queryKey: ['/api/jobs?limit=3'],
    select: (data) => data?.filter(job => job.status === 'open' || job.status === 'in_progress').slice(0, 3)
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
