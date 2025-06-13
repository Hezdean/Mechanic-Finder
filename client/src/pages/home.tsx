import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  MapPin, 
  Star, 
  Clock, 
  Shield, 
  Wrench, 
  Car, 
  Users,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail
} from "lucide-react";
import { formatCurrency, getFullName } from "@/lib/utils";

const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch mechanics for the "Choose Your Mechanic" section
  const { data: mechanicsData = [], isLoading } = useQuery({
    queryKey: ['/api/mechanic-profiles'],
  });

  // Type the mechanics data properly
  const mechanics = mechanicsData as any[];

  // Filter mechanics based on search
  const filteredMechanics = mechanics.filter((mechanic: any) => 
    mechanic.specializations?.some((spec: string) => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    ) || searchTerm === ""
  );

  return (
    <>
      <Helmet>
        <title>Mechanic Finder - Connect with Trusted Auto Repair Experts</title>
        <meta name="description" content="Find verified mechanics in your area or browse expert profiles. Get quality auto repairs with transparent pricing and trusted professionals." />
      </Helmet>
      
      <main className="min-h-screen">
        {/* New Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/5 via-accent/5 to-primary/10 py-20">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold text-foreground mb-6 leading-tight">
                  Find the Perfect 
                  <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text"> Mechanic</span> for Your Car
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Connect directly with verified mechanics in your area. Compare profiles, read reviews, and choose the expert that's right for your vehicle.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/mechanics">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8 py-3">
                      Browse Mechanics
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/jobs/post">
                    <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 px-8 py-3">
                      Post a Repair Job
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-white/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Shield className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <h3 className="font-semibold">Verified Mechanics</h3>
                          <p className="text-sm text-muted-foreground">All certified professionals</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur mt-8">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Star className="h-8 w-8 text-accent mr-3" />
                        <div>
                          <h3 className="font-semibold">5-Star Reviews</h3>
                          <p className="text-sm text-muted-foreground">Trusted by customers</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <Clock className="h-8 w-8 text-primary mr-3" />
                        <div>
                          <h3 className="font-semibold">Quick Response</h3>
                          <p className="text-sm text-muted-foreground">Fast turnaround times</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-white/80 backdrop-blur mt-8">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <MapPin className="h-8 w-8 text-accent mr-3" />
                        <div>
                          <h3 className="font-semibold">Local Experts</h3>
                          <p className="text-sm text-muted-foreground">Mechanics near you</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Choose Your Mechanic Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                Choose Your Mechanic
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Browse our verified mechanics, compare their specializations, and select the perfect expert for your vehicle's needs.
              </p>
            </div>

            {/* Search and Filter */}
            <div className="max-w-md mx-auto mb-12">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by specialization (e.g., Engine Repair)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            {/* Mechanics Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMechanics.map((mechanic: any) => (
                  <Card key={mechanic.id} className="hover:shadow-lg transition-shadow duration-300 group">
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <Avatar className="h-16 w-16 mr-4">
                          <AvatarImage src={mechanic.user?.profilePicture} />
                          <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                            {mechanic.user ? getFullName(mechanic.user.firstName, mechanic.user.lastName).split(' ').map((n: string) => n[0]).join('') : 'M'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            {mechanic.user ? getFullName(mechanic.user.firstName, mechanic.user.lastName) : 'Unknown Mechanic'}
                          </h3>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-accent fill-current mr-1" />
                            <span className="text-sm font-medium">{(mechanic.rating / 10).toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground ml-1">({mechanic.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-2">{mechanic.yearsOfExperience} years experience</p>
                        <p className="font-semibold text-lg text-primary">{formatCurrency(mechanic.hourlyRate)}/hour</p>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium mb-2">Specializations:</p>
                        <div className="flex flex-wrap gap-1">
                          {mechanic.specializations?.slice(0, 3).map((spec: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                          {mechanic.specializations?.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{mechanic.specializations.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {mechanic.isMobile && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Car className="h-3 w-3 mr-1" />
                              Mobile Service
                            </Badge>
                          )}
                          {mechanic.isVerified && (
                            <Badge className="bg-blue-100 text-blue-800 text-xs ml-2">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t">
                        <Link href={`/mechanics/${mechanic.id}`}>
                          <Button className="w-full bg-primary hover:bg-primary/90 text-white group-hover:shadow-md transition-all">
                            View Profile & Contact
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredMechanics.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No mechanics found</h3>
                <p className="text-muted-foreground">Try adjusting your search or browse all mechanics.</p>
                <Link href="/mechanics">
                  <Button className="mt-4">Browse All Mechanics</Button>
                </Link>
              </div>
            )}

            <div className="text-center mt-12">
              <Link href="/mechanics">
                <Button variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10">
                  View All Mechanics
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                How It Works
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Getting your car repaired has never been easier. Follow these simple steps to connect with trusted mechanics.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Search className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">1. Browse & Choose</h3>
                <p className="text-muted-foreground">
                  Search through verified mechanics in your area. Compare profiles, specializations, and reviews to find the perfect match.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-accent/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Phone className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">2. Contact Directly</h3>
                <p className="text-muted-foreground">
                  Reach out to your chosen mechanic directly through our platform. Discuss your needs and get a personalized quote.
                </p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                  <Wrench className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">3. Get Fixed</h3>
                <p className="text-muted-foreground">
                  Schedule your repair and get quality service from trusted professionals. Leave a review to help other car owners.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 bg-neutral-50">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <div className="text-muted-foreground">Verified Mechanics</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">2,000+</div>
                <div className="text-muted-foreground">Happy Customers</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <div className="text-muted-foreground">Satisfaction Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-accent mb-2">24/7</div>
                <div className="text-muted-foreground">Platform Support</div>
              </div>
            </div>
          </div>
        </section>

        {/* Join CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary to-accent">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to Get Your Car Fixed?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of satisfied customers who found their perfect mechanic through our platform.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mechanics">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90 px-8 py-3">
                  Find a Mechanic
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 px-8 py-3">
                  Join as Mechanic
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
