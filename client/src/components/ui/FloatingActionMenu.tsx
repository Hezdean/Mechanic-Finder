import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { 
  Plus, 
  AlertTriangle, 
  X,
  ChevronUp
} from "lucide-react";

export default function FloatingActionMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  // Only show for car owners/users
  if (!user || user.role !== "user") {
    return null;
  }

  const handlePostJob = () => {
    setLocation("/jobs/post");
    setIsOpen(false);
  };

  const handleEmergency = () => {
    setLocation("/emergency");
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <Card className="mb-3 bg-card/95 border backdrop-blur-sm shadow-xl">
          <div className="p-3 space-y-2">
            <Button
              onClick={handlePostJob}
              className="w-full justify-start bg-primary hover:bg-primary/90 text-primary-foreground"
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Post Job
            </Button>
            <Button
              onClick={handleEmergency}
              className="w-full justify-start bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              size="sm"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Emergency
            </Button>
          </div>
        </Card>
      )}
      
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-200 ${
          isOpen 
            ? "bg-muted hover:bg-muted/80 rotate-180" 
            : "bg-primary hover:bg-primary/90"
        }`}
        size="icon"
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground" />
        ) : (
          <ChevronUp className="h-6 w-6 text-primary-foreground" />
        )}
      </Button>
    </div>
  );
}