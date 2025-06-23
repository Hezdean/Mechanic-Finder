import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Star, ShoppingCart, Package, Truck, Shield, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PartDetail = () => {
  const { id } = useParams();
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { data: part, isLoading } = useQuery({
    queryKey: ["/api/parts", id],
    queryFn: async () => {
      const response = await fetch(`/api/parts/${id}`);
      if (!response.ok) throw new Error("Failed to fetch part");
      return response.json();
    }
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["/api/parts", id, "reviews"],
    queryFn: async () => {
      const response = await fetch(`/api/parts/${id}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews");
      return response.json();
    }
  });

  const { data: relatedParts = [] } = useQuery({
    queryKey: ["/api/parts", id, "related"],
    queryFn: async () => {
      const response = await fetch(`/api/parts/${id}/related`);
      if (!response.ok) throw new Error("Failed to fetch related parts");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="aspect-square bg-muted rounded"></div>
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-6 bg-muted rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!part) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Part not found</h2>
          <p className="text-muted-foreground mb-4">The part you're looking for doesn't exist.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              {part.images?.[0] ? (
                <img 
                  src={part.images[0]} 
                  alt={part.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Package className="h-24 w-24 text-muted-foreground" />
              )}
            </div>
            
            {part.images && part.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {part.images.slice(1, 5).map((image: string, index: number) => (
                  <div key={index} className="aspect-square bg-muted rounded border">
                    <img 
                      src={image} 
                      alt={`${part.name} ${index + 2}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{part.name}</h1>
              <p className="text-muted-foreground mb-4">{part.brand}</p>
              
              {part.partNumber && (
                <p className="text-sm text-muted-foreground mb-4">
                  Part Number: <span className="font-mono">{part.partNumber}</span>
                </p>
              )}

              <div className="flex items-center gap-2 mb-4">
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
              </div>

              <div className="flex items-center gap-4 mb-6">
                <span className="text-3xl font-bold text-primary">${part.price}</span>
                <Badge variant={part.stockQuantity > 0 ? "secondary" : "destructive"}>
                  {part.stockQuantity > 0 ? `${part.stockQuantity} in stock` : "Out of stock"}
                </Badge>
                {part.condition !== "new" && (
                  <Badge variant="outline">{part.condition}</Badge>
                )}
              </div>
            </div>

            {/* Add to Cart */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">Quantity:</label>
                    <select 
                      value={selectedQuantity}
                      onChange={(e) => setSelectedQuantity(parseInt(e.target.value))}
                      className="border rounded px-2 py-1"
                      disabled={part.stockQuantity === 0}
                    >
                      {[...Array(Math.min(10, part.stockQuantity))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>{i + 1}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1" 
                    disabled={part.stockQuantity === 0}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="icon">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    <span>Free shipping on orders over $50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>{part.warranty || "1 year warranty"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Vendor Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Sold by</h3>
                <Link href={`/marketplace/vendor/${part.vendorId}`}>
                  <div className="flex items-center justify-between hover:bg-muted p-2 rounded">
                    <div>
                      <p className="font-medium">{part.vendor?.businessName}</p>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">4.8 (156 reviews)</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">View Store</Button>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="description" className="mb-8">
          <TabsList>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
            <TabsTrigger value="compatibility">Compatibility</TabsTrigger>
            <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground leading-relaxed">
                  {part.description}
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {part.specifications ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(part.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between border-b pb-2">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specifications available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compatibility" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {part.compatibility && part.compatibility.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {part.compatibility.map((vehicle: string, index: number) => (
                      <Badge key={index} variant="outline" className="justify-start">
                        {vehicle}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Universal compatibility or compatibility information not available.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
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
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No reviews yet. Be the first to review this part!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Related Parts */}
        {relatedParts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Related Parts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {relatedParts.slice(0, 4).map((relatedPart: any) => (
                <Link key={relatedPart.id} href={`/marketplace/part/${relatedPart.id}`}>
                  <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                        {relatedPart.images?.[0] ? (
                          <img 
                            src={relatedPart.images[0]} 
                            alt={relatedPart.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <h3 className="font-semibold text-sm mb-2 truncate">{relatedPart.name}</h3>
                      <p className="text-muted-foreground text-xs mb-2">{relatedPart.brand}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-primary">${relatedPart.price}</span>
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartDetail;