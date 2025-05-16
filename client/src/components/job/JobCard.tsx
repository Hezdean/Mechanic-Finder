import { Link } from "wouter";
import { Car, MapPin, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, getTimeAgo, getStatusBadgeColor, shortenText } from "@/lib/utils";

interface JobCardProps {
  id: number;
  title: string;
  vehicle: string;
  location: string;
  status: string;
  description: string;
  createdAt: string;
  bidCount: number;
}

const JobCard = ({
  id,
  title,
  vehicle,
  location,
  status,
  description,
  createdAt,
  bidCount,
}: JobCardProps) => {
  const statusClassName = getStatusBadgeColor(status);
  const statusLabel = status.replace('_', ' ');
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
          <Badge className={cn(statusClassName, "capitalize")}>
            {statusLabel}
          </Badge>
        </div>
        
        <div className="mt-2 flex items-center text-sm text-neutral-500">
          <Car className="mr-1 h-4 w-4" />
          <span>{vehicle}</span>
        </div>
        
        <div className="mt-1 flex items-center text-sm text-neutral-500">
          <MapPin className="mr-1 h-4 w-4" />
          <span>{location}</span>
        </div>
        
        <p className="mt-4 text-sm text-neutral-600">
          {shortenText(description, 120)}
        </p>
        
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-neutral-400 mr-1" />
              <span className="text-neutral-500 text-sm">{getTimeAgo(createdAt)}</span>
              <span className="mx-2 text-neutral-300">•</span>
              <span className="text-neutral-500 text-sm">{bidCount} bid{bidCount !== 1 ? "s" : ""}</span>
            </div>
            <Link href={`/jobs/${id}`}>
              <Button size="sm" className="text-white bg-primary-500 hover:bg-primary-600">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
