import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const JoinCTA = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="bg-primary-500 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Ready to get started?</h2>
            <p className="mt-2 text-lg text-primary-100">Join thousands of mechanics and car owners on our platform.</p>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row lg:mt-0 lg:flex-shrink-0 space-y-4 sm:space-y-0 sm:space-x-4">
            {isAuthenticated ? (
              <>
                {user?.role === "mechanic" ? (
                  <Link href="/dashboard/mechanic">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-neutral-100 border-white">
                      View Dashboard
                    </Button>
                  </Link>
                ) : (
                  <Link href="/register">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-neutral-100 border-white">
                      Become a Mechanic
                    </Button>
                  </Link>
                )}
                <Link href="/jobs/post">
                  <Button size="lg" className="w-full sm:w-auto bg-secondary-500 hover:bg-secondary-600 text-white">
                    Post a Repair Job
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/register?role=mechanic">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Join as a Mechanic
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto">
                    Sign Up as a Car Owner
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinCTA;
