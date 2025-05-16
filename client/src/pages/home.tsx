import HeroSection from "@/components/home/HeroSection";
import HowItWorks from "@/components/home/HowItWorks";
import FeaturedMechanics from "@/components/home/FeaturedMechanics";
import PostJobSection from "@/components/home/PostJobSection";
import RecentJobs from "@/components/home/RecentJobs";
import Testimonials from "@/components/home/Testimonials";
import JoinCTA from "@/components/home/JoinCTA";
import { Helmet } from "react-helmet";

const Home = () => {
  return (
    <>
      <Helmet>
        <title>Same-Shit - Auto Repair Marketplace</title>
        <meta name="description" content="Same-Shit connects car owners with trusted mechanics for hassle-free auto repairs. Find verified mechanics in your area or post your repair job today." />
      </Helmet>
      
      <main>
        <HeroSection />
        <HowItWorks />
        <FeaturedMechanics />
        <PostJobSection />
        <RecentJobs />
        <Testimonials />
        <JoinCTA />
      </main>
    </>
  );
};

export default Home;
