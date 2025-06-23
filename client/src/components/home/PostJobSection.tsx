import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PostJobSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Ready to Fix Your Car?
          </h2>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of car owners who have found reliable mechanics through our platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/jobs/post">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4">
                  Post a Job Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Link href="/mechanics">
              <Button variant="outline" size="lg" className="px-8 py-4">
                <Car className="mr-2 h-5 w-5" />
                Browse Mechanics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostJobSection;