import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const HeroSection = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <section className="relative text-white">
      <div 
        className="absolute inset-0 bg-primary-500/80 z-10"
        style={{ 
          backgroundImage: "linear-gradient(rgba(30, 92, 151, 0.9), rgba(30, 92, 151, 0.7))",
        }}
      ></div>
      
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://pixabay.com/get/gfbd1abbcb04cf40203684c7415aad8c737bd13e6f9c3dd5bb72adb2d536b8064535b2ff8c79e07fb1a0c5121a5c668629ec4978f7b33c7a03b8e9b5ba8dddf6e_1280.jpg')",
          backgroundPosition: "center",
        }}
      ></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-20">
        <div className="max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight">Auto repairs, simplified.</h1>
          <p className="mt-4 text-lg sm:text-xl">Connect with trusted mechanics in your area who will repair your vehicle right the first time.</p>
          <div className="mt-8 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Link href="/mechanics">
              <Button size="lg" variant="secondary" className="bg-white text-primary-500 hover:bg-neutral-100">
                Find a Mechanic
              </Button>
            </Link>
            <Link href={isAuthenticated ? "/jobs/post" : "/register"}>
              <Button size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white">
                {isAuthenticated ? "Post a Repair Job" : "Join Now"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
