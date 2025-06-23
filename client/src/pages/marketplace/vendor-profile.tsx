import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, MapPin, Phone, Globe, Package, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VendorProfile = () => {
  const { id } = useParams();

  const { data: vendor, isLoading } = useQuery({
    queryKey: ["/api/vendors", id],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${id}`);
      if (!response.ok) throw new Error("Failed to fetch vendor");
      return response.json();
    }
  });

  const { data: parts = [] } = useQuery({
    queryKey: ["/api/vendors", id, "parts"],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${id}/parts`);
      if (!response.ok) throw new Error("Failed to fetch vendor parts");
      return response.json();
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/vendors", id, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/vendors/${id}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch vendor reviews");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="h-32 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Vendor not found</h2>
          <p className="text-muted-foreground mb-4">The vendor you're looking for doesn't exist.</p>
          <Link href="/marketplace">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/marketplace">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        {/* Vendor Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-32 h-32 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{vendor.businessName}</h1>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${
                              i < Math.floor(averageRating) 
                                ? "fill-yellow-400 text-yellow-400" 
                                : "text-muted-foreground"
                            }`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {averageRating.toFixed(1)} ({reviews.length} reviews)
                      </span>
                      {vendor.isVerified && (
                        <Badge variant="secondary" className="ml-2">
                          <Award className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{vendor.totalSales}</p>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4">{vendor.description}</p>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {vendor.address && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{vendor.address}</span>
                    </div>
                  )}
                  {vendor.phoneNumber && (
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      <span>{vendor.phoneNumber}</span>
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="parts" className="space-y-6">
          <TabsList>
            <TabsTrigger value="parts">Parts ({parts.length})</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="parts">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {parts.map((part: any) => (
                <Link key={part.id} href={`/marketplace/part/${part.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        {part.images?.[0] ? (
                          <img 
                            src={part.images[0]} 
                            alt={part.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 line-clamp-2">{part.name}</h3>
                      <p className="text-muted-foreground text-xs mb-2">{part.brand}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${part.price}</span>
                        <Badge variant={part.stockQuantity > 0 ? "secondary" : "destructive"} className="text-xs">
                          {part.stockQuantity > 0 ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            
            {parts.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No parts available</h3>
                  <p className="text-muted-foreground">This vendor hasn't listed any parts yet.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reviews">
            <div className="space-y-6">
              {reviews.length > 0 ? (
                reviews.map((review: any) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.user?.firstName} {review.user?.lastName}</span>
                            {review.verified && (
                              <Badge variant="secondary" className="text-xs">Verified Purchase</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${
                                  i < review.rating 
                                    ? "fill-yellow-400 text-yellow-400" 
                                    : "text-muted-foreground"
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      
                      {review.title && (
                        <h4 className="font-semibold mb-2">{review.title}</h4>
                      )}
                      
                      {review.comment && (
                        <p className="text-muted-foreground">{review.comment}</p>
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
                    <p className="text-muted-foreground">Be the first to review this vendor!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {vendor.businessName}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Business Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Joined:</span>
                      <span className="ml-2">{new Date(vendor.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Sales:</span>
                      <span className="ml-2">{vendor.totalSales} orders</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="ml-2">{vendor.rating}/5.0</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={vendor.isVerified ? "secondary" : "outline"} className="ml-2">
                        {vendor.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {vendor.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{vendor.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VendorProfile;