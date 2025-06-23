import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Filter, Grid, List, Star, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Marketplace = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: parts = [], isLoading } = useQuery({
    queryKey: ["/api/parts", searchTerm, categoryFilter, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter !== "all") params.append("category", categoryFilter);
      params.append("sort", sortBy);
      
      const response = await fetch(`/api/parts?${params}`);
      if (!response.ok) throw new Error("Failed to fetch parts");
      return response.json();
    }
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    }
  });

  const { data: featuredParts = [] } = useQuery({
    queryKey: ["/api/parts/featured"],
    queryFn: async () => {
      const response = await fetch("/api/parts/featured");
      if (!response.ok) throw new Error("Failed to fetch featured parts");
      return response.json();
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Auto Parts Marketplace</h1>
            <p className="text-xl mb-8">Find quality parts from trusted vendors</p>
            <div className="max-w-2xl mx-auto relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for parts, brands, or part numbers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 text-foreground bg-background"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Parts */}
      {featuredParts.length > 0 && (
        <section className="py-12 border-b">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-6">Featured Parts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredParts.slice(0, 4).map((part: any) => (
                <Card key={part.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{part.name}</h3>
                    <p className="text-muted-foreground text-xs mb-2">{part.brand}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${part.price}</span>
                      <Badge variant="secondary">Featured</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Filters and Controls */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 flex flex-col sm:flex-row gap-4">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Parts Grid/List */}
        <div className={viewMode === "grid" ? 
          "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" : 
          "space-y-4"
        }>
          {parts.map((part: any) => (
            <Link key={part.id} href={`/marketplace/part/${part.id}`}>
              <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className={viewMode === "grid" ? "p-4" : "p-4 flex gap-4"}>
                  <div className={viewMode === "grid" ? 
                    "aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center" :
                    "w-24 h-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0"
                  }>
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
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-2 truncate">{part.name}</h3>
                    <p className="text-muted-foreground text-xs mb-2">{part.brand}</p>
                    
                    {part.partNumber && (
                      <p className="text-xs text-muted-foreground mb-2">Part #: {part.partNumber}</p>
                    )}
                    
                    <div className="flex items-center gap-1 mb-2">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-muted-foreground">4.5 (23)</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">${part.price}</span>
                      <div className="flex items-center gap-2">
                        {part.stockQuantity > 0 ? (
                          <Badge variant="secondary" className="text-xs">In Stock</Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        )}
                        <Button size="sm" variant="outline">
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {parts.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No parts found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;