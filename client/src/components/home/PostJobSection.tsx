import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, Car, Wrench, Shield, DollarSign, Clock, Star } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const PostJobSection = () => {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5 relative overflow-hidden">
      {/* Background Car Illustrations */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 transform rotate-12">
          <Car className="h-32 w-32 text-primary" />
        </div>
        <div className="absolute bottom-10 right-10 transform -rotate-12">
          <Wrench className="h-24 w-24 text-accent" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45">
          <Car className="h-40 w-40 text-primary/30" />
        </div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Car className="h-4 w-4 mr-2" />
              Car Trouble?
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Get Your Car Fixed 
              <span className="text-primary block">Without the Hassle</span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Post your repair needs and receive competitive quotes from verified mechanics 
              in your area. No more calling around or waiting in repair shops.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">No Upfront Costs</h3>
                  <p className="text-sm text-muted-foreground">Free to post jobs and receive quotes</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
