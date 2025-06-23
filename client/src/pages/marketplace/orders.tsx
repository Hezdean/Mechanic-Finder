import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Truck, CheckCircle, Clock, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["/api/orders", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      
      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) throw new Error("Failed to fetch orders");
      return response.json();
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <Package className="h-4 w-4" />;
      case "cancelled":
        return <X className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "shipped":
        return "default";
      case "delivered":
        return "secondary";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-64 mb-6"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track your parts orders and delivery status</p>
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            <div className="space-y-6">
              {orders.length > 0 ? (
                orders.map((order: any) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Placed on {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusColor(order.status)} className="mb-2">
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <p className="text-2xl font-bold">${order.total}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Order Items */}
                      <div className="space-y-3">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <div className="w-12 h-12 bg-background rounded flex items-center justify-center flex-shrink-0">
                              {item.part?.images?.[0] ? (
                                <img 
                                  src={item.part.images[0]} 
                                  alt={item.part.name}
                                  className="w-full h-full object-cover rounded"
                                />
                              ) : (
                                <Package className="h-6 w-6 text-muted-foreground" />
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium">{item.part?.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {item.part?.brand} • Qty: {item.quantity}
                              </p>
                            </div>
                            
                            <div className="text-right">
                              <p className="font-semibold">${item.totalPrice}</p>
                              <p className="text-sm text-muted-foreground">${item.unitPrice} each</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Shipping Information */}
                      {order.trackingNumber && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Tracking Information</p>
                              <p className="text-sm text-muted-foreground">
                                Tracking #: {order.trackingNumber}
                              </p>
                            </div>
                            <Button variant="outline" size="sm">
                              Track Package
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Shipping Address */}
                      {order.shippingAddress && (
                        <div className="text-sm text-muted-foreground">
                          <p className="font-medium mb-1">Shipping Address:</p>
                          <p>{order.shippingAddress.street}</p>
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}
                          </p>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="border-t pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal:</span>
                          <span>${order.subtotal}</span>
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Shipping:</span>
                            <span>${order.shippingCost}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span>Tax:</span>
                          <span>${order.tax}</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total:</span>
                          <span>${order.total}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                        {order.status === "delivered" && (
                          <Button variant="outline" size="sm">
                            Leave Review
                          </Button>
                        )}
                        {order.status === "pending" && (
                          <Button variant="destructive" size="sm">
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      {statusFilter === "all" 
                        ? "You haven't placed any orders yet."
                        : `No ${statusFilter} orders found.`
                      }
                    </p>
                    <Button>
                      Start Shopping
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Orders;