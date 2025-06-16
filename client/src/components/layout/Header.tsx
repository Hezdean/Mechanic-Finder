import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MobileMenu from "./MobileMenu";
import { Menu, User, LogOut, Settings, Drill, Car, MessageSquare, Receipt } from "lucide-react";

const Header = () => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  const getDashboardLink = () => {
    if (!user) return "/dashboard/user";
    
    switch (user.role) {
      case "admin":
        return "/dashboard/admin";
      case "mechanic":
        return "/dashboard/mechanic";
      default:
        return "/dashboard/user";
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="flex items-center">
                  <Drill className="h-8 w-auto text-primary" />
                  <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Mechanic Finder</span>
                </a>
              </Link>
            </div>
            <nav className="hidden md:ml-8 md:flex md:space-x-8">
              <Link href="/">
                <a className={`${location === "/" ? "text-primary font-medium border-b-2 border-primary" : "text-foreground hover:text-primary font-medium"} px-1 pt-5 pb-3`}>
                  Home
                </a>
              </Link>
              <Link href="/mechanics">
                <a className={`${location.startsWith("/mechanics") ? "text-primary font-medium border-b-2 border-primary" : "text-foreground hover:text-primary font-medium"} px-1 pt-5 pb-3`}>
                  Find Mechanics
                </a>
              </Link>
              <Link href="/jobs">
                <a className={`${location.startsWith("/jobs") && location !== "/jobs/post" ? "text-primary font-medium border-b-2 border-primary" : "text-foreground hover:text-primary font-medium"} px-1 pt-5 pb-3`}>
                  Browse Jobs
                </a>
              </Link>
              <Link href="/jobs/post">
                <a className={`${location === "/jobs/post" ? "text-primary font-medium border-b-2 border-primary" : "text-foreground hover:text-primary font-medium"} px-1 pt-5 pb-3`}>
                  Post a Job
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link href="/messages">
                  <a className="text-foreground hover:text-primary">
                    <MessageSquare className="h-5 w-5" />
                  </a>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.profilePicture} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {user?.firstName && user?.lastName ? getInitials(user.firstName, user.lastName) : "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={getDashboardLink()}>
                        <a className="flex cursor-pointer items-center">
                          <User className="mr-2 h-4 w-4" />
                          <span>Dashboard</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    {user?.role === "user" && (
                      <DropdownMenuItem asChild>
                        <Link href="/jobs/post">
                          <a className="flex cursor-pointer items-center">
                            <Car className="mr-2 h-4 w-4" />
                            <span>Post a Job</span>
                          </a>
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href="/messages">
                        <a className="flex cursor-pointer items-center">
                          <MessageSquare className="mr-2 h-4 w-4" />
                          <span>Messages</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/transactions">
                        <a className="flex cursor-pointer items-center">
                          <Receipt className="mr-2 h-4 w-4" />
                          <span>Transaction History</span>
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => logout()}
                        className="flex w-full cursor-pointer items-center text-left"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex space-x-3">
                <Link href="/login">
                  <Button variant="outline" className="text-primary border-primary hover:bg-primary/10">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
            <button
              type="button"
              className="md:hidden p-2 ml-4 rounded-md text-neutral-500 hover:text-neutral-900 focus:outline-none"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open menu</span>
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <MobileMenu 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </header>
  );
};

export default Header;
