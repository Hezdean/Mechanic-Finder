import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PostJobSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:flex lg:items-center lg:justify-between">
          <div className="lg:w-1/2 lg:pr-8">
            <h2 className="text-3xl font-bold text-neutral-900">Need car repairs?</h2>
            <p className="mt-4 text-xl text-neutral-600">Post your job and get bids from qualified mechanics in your area.</p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-secondary-500 h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-neutral-900">No upfront costs</h3>
                  <p className="mt-2 text-neutral-600">It's free to post a job and receive bids from mechanics.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-secondary-500 h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-neutral-900">Verified mechanics</h3>
                  <p className="mt-2 text-neutral-600">All mechanics are verified for credentials and experience.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckCircle className="text-secondary-500 h-6 w-6" />
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-neutral-900">Secure payments</h3>
                  <p className="mt-2 text-neutral-600">Only pay when you're satisfied with the completed repairs.</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href={isAuthenticated ? "/jobs/post" : "/register"}>
                <Button size="lg" className="bg-secondary-500 hover:bg-secondary-600 text-white">
                  Post a Repair Job Now
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="mt-10 lg:mt-0 lg:w-1/2">
            <div className="lg:pl-8">
              <img 
                className="rounded-lg shadow-lg object-cover w-full h-96" 
                src="https://pixabay.com/get/gfc8cc5c8ce845d5de1d1cfe0d54f8aaff394aebf41e9c21bb91fa9b358135988db91617dc47e2b34afec9f2c7d63703670a94110aaaa3126d1b7a478eb789e75_1280.jpg" 
                alt="Auto repair shop with modern equipment" 
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PostJobSection;
