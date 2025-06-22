import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import ServiceHistoryCard from "@/components/serviceHistory/ServiceHistoryCard";
import { useState } from "react";
import { 
  History, 
  Search, 
  Filter,
  FileText,
  TrendingUp
} from "lucide-react";

export default function ServiceHistoryPage() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const { data: serviceHistory = [], isLoading } = useQuery({
    queryKey: ['/api/service-history'],
    enabled: isAuthenticated,
  });

  const filteredHistory = serviceHistory.filter((record: any) => {
    const matchesSearch = record.serviceType.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || record.serviceType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const totalSpent = serviceHistory.reduce((sum: number, record: any) => sum + record.totalCost, 0);
  const totalServices = serviceHistory.length;
  const activeWarranties = serviceHistory.filter((record: any) => 
    record.warrantyExpiry && new Date(record.warrantyExpiry) > new Date()
  ).length;

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Service History</h1>
        <p className="text-neutral-600 mb-8">Please log in to view your service history.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-2">
          <History className="h-8 w-8" />
          Service History
        </h1>
        <p className="mt-2 text-neutral-600">
          Your complete digital logbook of vehicle services and repairs.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalServices}</p>
                <p className="text-sm text-neutral-600">Total Services</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">${totalSpent.toFixed(0)}</p>
                <p className="text-sm text-neutral-600">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Badge className="h-8 w-8 bg-purple-500 flex items-center justify-center text-white font-bold">
                {activeWarranties}
              </Badge>
              <div>
                <p className="text-2xl font-bold">{activeWarranties}</p>
                <p className="text-sm text-neutral-600">Active Warranties</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Services</SelectItem>
                  <SelectItem value="Oil Change">Oil Change</SelectItem>
                  <SelectItem value="Brake Service">Brake Service</SelectItem>
                  <SelectItem value="Engine Repair">Engine Repair</SelectItem>
                  <SelectItem value="Transmission">Transmission</SelectItem>
                  <SelectItem value="Inspection">Inspection</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service History List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-700 mb-2">
              {searchQuery || filterType !== "all" ? "No matching records" : "No service history yet"}
            </h3>
            <p className="text-neutral-500">
              {searchQuery || filterType !== "all" 
                ? "Try adjusting your search or filters" 
                : "Your vehicle service records will appear here after your first service"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredHistory.map((record: any) => (
            <ServiceHistoryCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}