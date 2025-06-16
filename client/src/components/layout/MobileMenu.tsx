import { Fragment } from "react";
import { Link, useLocation } from "wouter";
import { Bookmark } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="sm:max-w-md w-[80vw]">
        <SheetHeader className="mb-4">
          <SheetTitle className="text-left flex items-center">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">Mechanic Finder</span>
            <SheetClose className="ml-auto">
              <Bookmark className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </SheetClose>
          </SheetTitle>
        </SheetHeader>
        <div className="space-y-4 py-4">
          <div className="px-2 space-y-1">
            <Link href="/">
              <a 
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location === "/" 
                    ? "text-primary bg-primary/10" 
                    : "text-foreground hover:text-primary hover:bg-primary/5"
                }`}
                onClick={onClose}
              >
                Home
              </a>
            </Link>
            {(!user || user.role === "user") && (
              <Link href="/mechanics">
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.startsWith("/mechanics") 
                      ? "text-primary bg-primary/10" 
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={onClose}
                >
                  Find Mechanics
                </a>
              </Link>
            )}
            {user?.role === "mechanic" && (
              <Link href="/jobs">
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.startsWith("/jobs") && location !== "/jobs/post" 
                      ? "text-primary bg-primary/10" 
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={onClose}
                >
                  Browse Jobs
                </a>
              </Link>
            )}
            {(!user || user.role === "user") && (
              <Link href="/jobs/post">
                <a 
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === "/jobs/post" 
                      ? "text-primary bg-primary/10" 
                      : "text-foreground hover:text-primary hover:bg-primary/5"
                  }`}
                  onClick={onClose}
                >
                  Post a Job
                </a>
              </Link>
            )}
          </div>

          <div className="pt-4 pb-3 border-t border-primary/10">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="px-5 py-3">
                  <p className="text-base font-medium">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <Link href={getDashboardLink()}>
                  <a 
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/5"
                    onClick={onClose}
                  >
                    Dashboard
                  </a>
                </Link>
                <Link href="/messages">
                  <a 
                    className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-primary/5"
                    onClick={onClose}
                  >
                    Messages
                  </a>
                </Link>
                <button
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-destructive hover:bg-destructive/5"
                  onClick={handleLogout}
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1 px-3">
                <Link href="/login">
                  <Button 
                    variant="outline" 
                    className="w-full justify-center text-primary border-primary hover:bg-primary/10"
                    onClick={onClose}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    className="w-full justify-center mt-2 bg-accent hover:bg-accent/90 text-accent-foreground"
                    onClick={onClose}
                  >
                    Join Now
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
