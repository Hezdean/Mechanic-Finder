import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useEffect } from "react";
import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedMechanics from "@/components/home/FeaturedMechanics";
import RecentJobs from "@/components/home/RecentJobs";
import Testimonials from "@/components/home/Testimonials";
import PostJobSection from "@/components/home/PostJobSection";
import JoinCTA from "@/components/home/JoinCTA";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, setLocation]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <HeroSection />
      <HowItWorks />
      <FeaturedMechanics />
      <PostJobSection />
      <RecentJobs />
      <Testimonials />
      <JoinCTA />
    </div>
  );
};

export default Home;