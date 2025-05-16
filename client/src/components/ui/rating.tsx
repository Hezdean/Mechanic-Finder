import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingProps {
  value: number; // 0-50 (0-5 stars with decimal)
  count?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

const Rating = ({ value, count = 0, size = "md", showCount = true, className }: RatingProps) => {
  // Convert value (0-50) to stars (0-5)
  const stars = value / 10;
  
  // Sizes for stars
  const sizeStyles = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  
  // Generate star elements
  const renderStars = () => {
    const starElements = [];
    const fullStars = Math.floor(stars);
    const hasHalfStar = stars % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      starElements.push(
        <Star key={`star-${i}`} className={cn("text-yellow-400 fill-yellow-400", sizeStyles[size])} />
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      starElements.push(
        <StarHalf key="half-star" className={cn("text-yellow-400 fill-yellow-400", sizeStyles[size])} />
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starElements.push(
        <Star key={`empty-star-${i}`} className={cn("text-yellow-400", sizeStyles[size])} />
      );
    }
    
    return starElements;
  };
  
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center">{renderStars()}</div>
      {showCount && count > 0 && (
        <span className={cn("ml-2 text-neutral-600", {
          "text-xs": size === "sm",
          "text-sm": size === "md",
          "text-base": size === "lg",
        })}>
          {stars.toFixed(1)} ({count} reviews)
        </span>
      )}
    </div>
  );
};

export default Rating;
