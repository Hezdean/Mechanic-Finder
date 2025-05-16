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
    <footer className="bg-neutral-800 text-neutral-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Same-Shit</h3>
            <p className="mb-4">Connecting car owners with trusted mechanics for hassle-free auto repairs.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-white">
                <FacebookIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-white">
                <LinkedinIcon className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/">
                  <a className="hover:text-white">Home</a>
                </Link>
              </li>
              <li>
                <Link href="/mechanics">
                  <a className="hover:text-white">Find Mechanics</a>
                </Link>
              </li>
              <li>
                <Link href="/jobs">
                  <a className="hover:text-white">Browse Jobs</a>
                </Link>
              </li>
              <li>
                <Link href="/jobs/post">
                  <a className="hover:text-white">Post a Job</a>
                </Link>
              </li>
              <li>
                <Link href="/register">
                  <a className="hover:text-white">Become a Mechanic</a>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Help & Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white">FAQs</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Contact Us</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="hover:text-white">Trust & Safety</a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white text-lg font-semibold mb-4">Newsletter</h3>
            <p className="mb-4">Subscribe to our newsletter for tips, new mechanics, and updates.</p>
            <form className="flex">
              <Input 
                type="email" 
                placeholder="Your email" 
                className="bg-neutral-700 border-neutral-600 focus:ring-primary-500 rounded-r-none" 
              />
              <Button type="submit" className="bg-primary-500 hover:bg-primary-600 text-white rounded-l-none">
                <SendIcon className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-neutral-700 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} Same-Shit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
