import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import MechanicCard from "@/components/mechanic/MechanicCard";
import { Skeleton } from "@/components/ui/skeleton";

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

const FeaturedMechanics = () => {
  const { data: mechanics, isLoading } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
    select: (data) => data.filter(mechanic => mechanic.user && mechanic.isVerified).slice(0, 3)
  });

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-900">Featured Mechanics</h2>
          <p className="mt-4 text-xl text-neutral-600 max-w-2xl mx-auto">Top-rated professionals ready to help with your auto repairs</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {isLoading ? (
            <>
              <SkeletonMechanicCard />
              <SkeletonMechanicCard />
              <SkeletonMechanicCard />
            </>
          ) : mechanics?.length ? (
            mechanics.map((mechanic) => (
              <MechanicCard
                key={mechanic.id}
                id={mechanic.id}
                userId={mechanic.userId}
                firstName={mechanic.user.firstName}
                lastName={mechanic.user.lastName}
                profilePicture={mechanic.user.profilePicture}
                city={mechanic.user.city || ""}
                state={mechanic.user.state || ""}
                specializations={mechanic.specializations || []}
                rating={mechanic.rating}
                reviewCount={mechanic.reviewCount}
                bio={mechanic.user.bio || `${mechanic.user.firstName} is a verified mechanic with ${mechanic.yearsOfExperience}+ years of experience.`}
              />
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-neutral-500">No verified mechanics found. Check back soon!</p>
            </div>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/mechanics">
            <Button className="bg-primary-500 hover:bg-primary-600 text-white">
              View All Mechanics <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMechanics;
