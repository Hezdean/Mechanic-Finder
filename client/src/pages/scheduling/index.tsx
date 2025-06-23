import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Helmet } from "react-helmet";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User, 
  Star,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Wrench,
  Car,
  Phone,
  Mail
} from "lucide-react";
import { format, addDays, isToday, isTomorrow, isAfter, isBefore } from "date-fns";

interface Booking {
  id: number;
  userId: number;
  mechanicId: number;
  serviceType: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  notes?: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
  };
  mechanic?: {
    name: string;
    rating: number;
    location: string;
    phone: string;
    specializations: string[];
  };
  estimatedDuration: number;
  price: number;
}

interface Mechanic {
  userId: number;
  name: string;
  rating: number;
  location: string;
  phone: string;
  email: string;
  specializations: string[];
  availability: {
    [key: string]: string[]; // date -> available time slots
  };
  hourlyRate: number;
  responseTime: number;
}

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30"
];

const serviceTypes = [
  { value: "oil_change", label: "Oil Change", duration: 1, basePrice: 45 },
  { value: "brake_service", label: "Brake Service", duration: 2, basePrice: 150 },
  { value: "engine_diagnostic", label: "Engine Diagnostic", duration: 1.5, basePrice: 120 },
  { value: "tire_service", label: "Tire Service", duration: 1, basePrice: 80 },
  { value: "transmission", label: "Transmission Service", duration: 3, basePrice: 250 },
  { value: "electrical", label: "Electrical Repair", duration: 2, basePrice: 180 },
  { value: "ac_service", label: "A/C Service", duration: 1.5, basePrice: 130 },
  { value: "general_repair", label: "General Repair", duration: 2, basePrice: 100 }
];

export default function SchedulingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedMechanic, setSelectedMechanic] = useState<Mechanic | null>(null);
  const [selectedService, setSelectedService] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState({
    make: "",
    model: "",
    year: new Date().getFullYear()
  });
  const [notes, setNotes] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [isViewBookingOpen, setIsViewBookingOpen] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  // Fetch user's bookings
  const { data: bookings = [], isLoading: bookingsLoading, error: bookingsError } = useQuery({
    queryKey: ['/api/bookings'],
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Fetch available mechanics
  const { data: mechanics = [], isLoading: mechanicsLoading, error: mechanicsError } = useQuery({
    queryKey: ['/api/mechanics/available'],
    refetchInterval: 60000,
  });

  // Generate mock mechanics data with availability
  const mockMechanics: Mechanic[] = [
    {
      userId: 2,
      name: "Mike Johnson",
      rating: 4.8,
      location: "Downtown Auto Center",
      phone: "(555) 123-4567",
      email: "mike@autorepair.com",
      specializations: ["Engine Repair", "Brake Service", "Oil Change"],
      availability: {
        [format(new Date(), 'yyyy-MM-dd')]: ["09:00", "10:00", "14:00", "15:00"],
        [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ["08:00", "09:30", "11:00", "13:00", "16:00"],
        [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: ["08:30", "10:30", "12:00", "14:30", "17:00"],
      },
      hourlyRate: 85,
      responseTime: 15
    },
    {
      userId: 3,
      name: "Sarah Davis",
      rating: 4.9,
      location: "Quick Fix Garage",
      phone: "(555) 234-5678",
      email: "sarah@quickfix.com",
      specializations: ["Transmission", "Electrical", "A/C Service"],
      availability: {
        [format(new Date(), 'yyyy-MM-dd')]: ["08:30", "11:30", "13:30", "16:30"],
        [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ["09:00", "10:30", "12:30", "15:30"],
        [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: ["08:00", "11:00", "14:00", "16:00"],
      },
      hourlyRate: 95,
      responseTime: 10
    },
    {
      userId: 4,
      name: "Carlos Rodriguez",
      rating: 4.7,
      location: "Rodriguez Auto Shop",
      phone: "(555) 345-6789",
      email: "carlos@rodriguezauto.com",
      specializations: ["Tire Service", "General Repair", "Engine Diagnostic"],
      availability: {
        [format(new Date(), 'yyyy-MM-dd')]: ["10:00", "12:00", "15:00", "17:00"],
        [format(addDays(new Date(), 1), 'yyyy-MM-dd')]: ["08:30", "11:30", "14:30", "16:30"],
        [format(addDays(new Date(), 2), 'yyyy-MM-dd')]: ["09:30", "12:30", "15:30", "17:30"],
      },
      hourlyRate: 75,
      responseTime: 20
    }
  ];

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: (bookingData: any) =>
      apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsBookingDialogOpen(false);
      resetBookingForm();
      toast({
        title: "Appointment booked",
        description: "Your appointment has been scheduled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Failed to book appointment.",
        variant: "destructive",
      });
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: (bookingId: number) =>
      apiRequest(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({
        title: "Appointment cancelled",
        description: "Your appointment has been cancelled.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation failed",
        description: error.message || "Failed to cancel appointment.",
        variant: "destructive",
      });
    },
  });

  const resetBookingForm = () => {
    setSelectedDate(new Date());
    setSelectedTime("");
    setSelectedMechanic(null);
    setSelectedService("");
    setVehicleInfo({ make: "", model: "", year: new Date().getFullYear() });
    setNotes("");
  };

  const handleBookAppointment = () => {
    if (!selectedMechanic || !selectedDate || !selectedTime || !selectedService) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (!vehicleInfo.make || !vehicleInfo.model) {
      toast({
        title: "Vehicle information required",
        description: "Please provide your vehicle make and model.",
        variant: "destructive",
      });
      return;
    }

    const serviceType = serviceTypes.find(s => s.value === selectedService);
    const bookingData = {
      mechanicId: selectedMechanic.userId,
      serviceType: selectedService,
      scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
      scheduledTime: selectedTime,
      vehicleInfo,
      notes,
      estimatedDuration: serviceType?.duration || 1,
      price: (serviceType?.basePrice || 100) + (selectedMechanic.hourlyRate * (serviceType?.duration || 1))
    };

    bookAppointmentMutation.mutate(bookingData);
  };

  const getAvailableSlots = (mechanic: Mechanic, date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return mechanic.availability[dateKey] || [];
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatBookingDate = (date: string) => {
    const bookingDate = new Date(date);
    if (isToday(bookingDate)) return "Today";
    if (isTomorrow(bookingDate)) return "Tomorrow";
    return format(bookingDate, 'MMM dd, yyyy');
  };

  // Mock upcoming bookings
  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: user?.id || 0,
      mechanicId: 2,
      serviceType: "oil_change",
      scheduledDate: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
      scheduledTime: "10:00",
      status: "confirmed",
      vehicleInfo: { make: "Honda", model: "Civic", year: 2020 },
      mechanic: {
        name: "Mike Johnson",
        rating: 4.8,
        location: "Downtown Auto Center",
        phone: "(555) 123-4567",
        specializations: ["Engine Repair", "Brake Service"]
      },
      estimatedDuration: 1,
      price: 130,
      notes: "Regular oil change service"
    }
  ];

  const allBookings = [...mockBookings, ...bookings];
  const upcomingBookings = allBookings.filter(booking => 
    isAfter(new Date(booking.scheduledDate), new Date()) || 
    (isToday(new Date(booking.scheduledDate)) && booking.status !== 'completed')
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Log In</h1>
          <p>You need to be logged in to access scheduling.</p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (bookingsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (bookingsError) {
    console.error('Bookings error:', bookingsError);
  }
  if (mechanicsError) {
    console.error('Mechanics error:', mechanicsError);
  }

  return (
    <>
      <Helmet>
        <title>Schedule Service - AutoRepair</title>
        <meta name="description" content="Book appointments with trusted mechanics in your area" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Schedule Service</h1>
          <p className="text-muted-foreground">Book appointments with trusted mechanics in your area</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{upcomingBookings.length}</div>
              <div className="text-sm text-muted-foreground">Upcoming</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{mockMechanics.length}</div>
              <div className="text-sm text-muted-foreground">Available Mechanics</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{serviceTypes.length}</div>
              <div className="text-sm text-muted-foreground">Service Types</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">4.8</div>
              <div className="text-sm text-muted-foreground">Avg Rating</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      Upcoming Appointments
                    </CardTitle>
                    <CardDescription>Your scheduled services</CardDescription>
                  </div>
                  <Button onClick={() => setIsBookingDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Book Service
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-8">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No upcoming appointments</p>
                    <Button onClick={() => setIsBookingDialogOpen(true)}>
                      Schedule Your First Service
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">
                                {serviceTypes.find(s => s.value === booking.serviceType)?.label || booking.serviceType}
                              </h3>
                              <Badge className={getStatusBadgeColor(booking.status)}>
                                {booking.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" />
                                {formatBookingDate(booking.scheduledDate)} at {booking.scheduledTime}
                              </div>
                              <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {booking.mechanic?.name}
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3 w-3" />
                                {booking.mechanic?.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Car className="h-3 w-3" />
                                {booking.vehicleInfo.year} {booking.vehicleInfo.make} {booking.vehicleInfo.model}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-lg">${booking.price}</div>
                            <div className="text-sm text-muted-foreground">{booking.estimatedDuration}h service</div>
                            <div className="flex gap-2 mt-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  setViewingBooking(booking);
                                  setIsViewBookingOpen(true);
                                }}
                              >
                                View
                              </Button>
                              {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => cancelBookingMutation.mutate(booking.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Mechanics */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Available Mechanics
                </CardTitle>
                <CardDescription>Find mechanics in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Search by location..."
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    {mockMechanics.map((mechanic) => (
                      <div key={mechanic.userId} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{mechanic.name}</h4>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{mechanic.rating}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {mechanic.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            ~{mechanic.responseTime} min response
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {mechanic.specializations.slice(0, 2).map((spec) => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full mt-3"
                          onClick={() => {
                            setSelectedMechanic(mechanic);
                            setIsBookingDialogOpen(true);
                          }}
                        >
                          Book with {mechanic.name.split(' ')[0]}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Book Appointment Dialog */}
        <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Book Service Appointment</DialogTitle>
              <DialogDescription>
                Schedule your vehicle service with {selectedMechanic?.name || "a mechanic"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Mechanic Selection */}
              {!selectedMechanic && (
                <div>
                  <label className="text-sm font-medium">Select Mechanic</label>
                  <Select onValueChange={(value) => {
                    const mechanic = mockMechanics.find(m => m.userId.toString() === value);
                    setSelectedMechanic(mechanic || null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a mechanic" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMechanics.map((mechanic) => (
                        <SelectItem key={mechanic.userId} value={mechanic.userId.toString()}>
                          {mechanic.name} - {mechanic.location} (★{mechanic.rating})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedMechanic && (
                <div className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{selectedMechanic.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedMechanic.location}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span>{selectedMechanic.rating}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Service Type */}
              <div>
                <label className="text-sm font-medium">Service Type</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTypes.map((service) => (
                      <SelectItem key={service.value} value={service.value}>
                        {service.label} - ${service.basePrice} ({service.duration}h)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        disabled={(date) => isBefore(date, new Date()) || isToday(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Time</label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedMechanic && selectedDate ? 
                        getAvailableSlots(selectedMechanic, selectedDate).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        )) :
                        timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Vehicle Information */}
              <div>
                <label className="text-sm font-medium">Vehicle Information <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <Input
                    placeholder="Make (e.g., Honda)"
                    value={vehicleInfo.make}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, make: e.target.value})}
                    className={!vehicleInfo.make ? "border-red-300" : ""}
                    required
                  />
                  <Input
                    placeholder="Model (e.g., Civic)"
                    value={vehicleInfo.model}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, model: e.target.value})}
                    className={!vehicleInfo.model ? "border-red-300" : ""}
                    required
                  />
                  <Input
                    type="number"
                    placeholder="Year"
                    value={vehicleInfo.year}
                    onChange={(e) => setVehicleInfo({...vehicleInfo, year: parseInt(e.target.value)})}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
                {(!vehicleInfo.make || !vehicleInfo.model) && (
                  <p className="text-xs text-red-500 mt-1">Vehicle make and model are required</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  placeholder="Describe the issue or special requirements..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Price Estimate */}
              {selectedService && selectedMechanic && (
                <div className="border rounded-lg p-4 bg-blue-50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="text-xl font-bold text-blue-600">
                      ${((serviceTypes.find(s => s.value === selectedService)?.basePrice || 0) + 
                        (selectedMechanic.hourlyRate * (serviceTypes.find(s => s.value === selectedService)?.duration || 1))).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Base service:</span>
                      <span>${serviceTypes.find(s => s.value === selectedService)?.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Labor ({serviceTypes.find(s => s.value === selectedService)?.duration}h @ ${selectedMechanic.hourlyRate}/hr):</span>
                      <span>${selectedMechanic.hourlyRate * (serviceTypes.find(s => s.value === selectedService)?.duration || 1)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Summary */}
              {selectedMechanic && selectedDate && selectedTime && selectedService && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-medium text-green-800 mb-2">Booking Summary</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">{serviceTypes.find(s => s.value === selectedService)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span className="font-medium">{format(selectedDate, 'PPP')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Mechanic:</span>
                      <span className="font-medium">{selectedMechanic.name}</span>
                    </div>
                    {vehicleInfo.make && vehicleInfo.model && (
                      <div className="flex justify-between">
                        <span>Vehicle:</span>
                        <span className="font-medium">{vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-end gap-2 pt-6 border-t mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsBookingDialogOpen(false);
                  resetBookingForm();
                }}
                disabled={bookAppointmentMutation.isPending}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleBookAppointment}
                disabled={
                  bookAppointmentMutation.isPending || 
                  !selectedMechanic || 
                  !selectedDate || 
                  !selectedTime || 
                  !selectedService ||
                  !vehicleInfo.make ||
                  !vehicleInfo.model
                }
                className="min-w-[140px] px-6"
              >
                {bookAppointmentMutation.isPending ? "Booking..." : "Book Appointment"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Booking Dialog */}
        <Dialog open={isViewBookingOpen} onOpenChange={setIsViewBookingOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {viewingBooking && (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge className={`${getStatusBadgeColor(viewingBooking.status)} mb-2`}>
                    {viewingBooking.status.toUpperCase()}
                  </Badge>
                  <h3 className="text-lg font-semibold">
                    {serviceTypes.find(s => s.value === viewingBooking.serviceType)?.label}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{formatBookingDate(viewingBooking.scheduledDate)} at {viewingBooking.scheduledTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingBooking.mechanic?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingBooking.mechanic?.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingBooking.mechanic?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingBooking.vehicleInfo.year} {viewingBooking.vehicleInfo.make} {viewingBooking.vehicleInfo.model}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{viewingBooking.estimatedDuration} hour service</span>
                  </div>
                </div>

                {viewingBooking.notes && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Notes</label>
                    <p className="text-sm mt-1">{viewingBooking.notes}</p>
                  </div>
                )}

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Cost:</span>
                    <span className="text-lg font-bold">${viewingBooking.price}</span>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewBookingOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}