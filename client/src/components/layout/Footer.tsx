import { Link } from "wouter";
import { 
  FacebookIcon, 
  TwitterIcon, 
  InstagramIcon, 
  LinkedinIcon, 
  SendIcon 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-foreground text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-accent text-lg font-semibold mb-4">Mechanic Finder</h3>
            <p className="mb-4">Connecting car owners with trusted mechanics for hassle-free auto repairs.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-secondary hover:text-accent transition-colors">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-accent text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="hover:text-accent transition-colors">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/mechanics">
                  <a className="hover:text-accent transition-colors">Find Mechanics</a>
                </Link>
              </li>
              <li>
                <Link href="/jobs">
                  <a className="hover:text-accent transition-colors">Browse Jobs</a>
                </Link>
              </li>
              <li>
                <Link href="/jobs/post">
                  <a className="hover:text-accent transition-colors">Post a Job</a>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <a className="hover:text-accent transition-colors">Become a Mechanic</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-accent text-lg font-semibold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-accent transition-colors">FAQs</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-accent transition-colors">Trust & Safety</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-accent text-lg font-semibold mb-4">Newsletter</h3>
            <p className="mb-4">Subscribe to our newsletter for tips, new mechanics, and updates.</p>
            <form className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-background border-primary focus:ring-accent rounded-r-none" 
              />
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-l-none">
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-primary/20 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Mechanic Finder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
