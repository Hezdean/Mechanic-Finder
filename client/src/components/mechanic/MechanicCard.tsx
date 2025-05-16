import { Link } from "wouter";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Rating from "@/components/ui/rating";
import { getFullName } from "@/lib/utils";

interface MechanicCardProps {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  profilePicture?: string;
  city: string;
  state: string;
  specializations: string[];
  rating: number;
  reviewCount: number;
  bio: string;
}

const MechanicCard = ({
  id,
  userId,
  firstName,
  lastName,
  profilePicture,
  city,
  state,
  specializations,
  rating,
  reviewCount,
  bio,
}: MechanicCardProps) => {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6">
        <div className="flex items-center">
          <Avatar className="h-14 w-14">
            <AvatarImage src={profilePicture} alt={getFullName(firstName, lastName)} />
            <AvatarFallback className="bg-primary-100 text-primary-800">
              {getInitials(firstName, lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-neutral-900">
              {getFullName(firstName, lastName)}
            </h3>
            <Rating value={rating} count={reviewCount} />
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          {specializations.slice(0, 3).map((specialization, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-primary-100 text-primary-800 hover:bg-primary-200"
            >
              {specialization}
            </Badge>
          ))}
        </div>
        
        <p className="mt-4 text-sm text-neutral-600">{bio}</p>
        
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-neutral-500 flex items-center">
            <MapPin className="mr-1 h-4 w-4" />
            {city}, {state}
          </span>
          <Link href={`/mechanics/${userId}`}>
            <Button variant="outline" className="text-primary-600 bg-primary-50 hover:bg-primary-100 border-primary-200">
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MechanicCard;
