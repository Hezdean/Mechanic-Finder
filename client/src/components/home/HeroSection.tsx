import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="relative bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden min-h-[80vh] flex items-center">
      {/* Simple Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-accent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Car className="h-16 w-16 text-accent" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
            Find Your 
            <span className="text-accent block">Perfect Mechanic</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-12 max-w-2xl mx-auto">
            Get quotes from trusted mechanics in your area. Fast, reliable, and affordable car repairs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/jobs/post">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg">
                  Post a Job
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/register">
                <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-4 text-lg">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            
            <Link href="/mechanics">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
                Browse Mechanics
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
