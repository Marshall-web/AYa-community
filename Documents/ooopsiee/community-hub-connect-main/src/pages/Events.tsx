import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Users, Music, Utensils, Camera,
  Mic, Sparkles, Check, Clock, Phone
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import eventHallImg from "@/assets/event-hall.jpg";
import api from "@/lib/api";

const eventPackages = [
  {
    name: "Basic",
    price: 1500,
    capacity: "Up to 100 guests",
    features: [
      "Hall rental (4 hours)",
      "Basic decorations",
      "Sound system",
      "50 chairs & 10 tables",
    ],
  },
  {
    name: "Standard",
    price: 3500,
    capacity: "Up to 250 guests",
    features: [
      "Hall rental (8 hours)",
      "Premium decorations",
      "DJ equipment",
      "150 chairs & 25 tables",
      "Basic catering",
      "Event coordinator",
    ],
    popular: true,
  },
  {
    name: "Premium",
    price: 7500,
    capacity: "Up to 500 guests",
    features: [
      "Hall rental (full day)",
      "Luxury decorations",
      "Full AV equipment",
      "300 chairs & 50 tables",
      "Full catering service",
      "Event planner",
      "Photography & Video",
      "Live band setup",
    ],
  },
];

const addOns = [
  { icon: Utensils, name: "Catering", price: "From ₵25/person" },
  { icon: Camera, name: "Photography", price: "From ₵80" },
  { icon: Music, name: "Live Band", price: "From ₵150" },
  { icon: Mic, name: "MC Services", price: "From ₵50" },
  { icon: Sparkles, name: "Extra Decorations", price: "From ₵30" },
];

const eventTypes = ["Wedding", "Birthday", "Conference", "Corporate Event", "Anniversary", "Graduation", "Other"];

export default function Events() {
  const [date, setDate] = useState<Date>();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [eventType, setEventType] = useState("");

  // Form state
  const [guestCount, setGuestCount] = useState("");
  const [duration, setDuration] = useState("4 hours");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");

  // Loading and message state
  const [isLoading, setIsLoading] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);

  // Consultation form state
  const [consultName, setConsultName] = useState("");
  const [consultPhone, setConsultPhone] = useState("");
  const [consultEmail, setConsultEmail] = useState("");
  const [consultDate, setConsultDate] = useState<Date>();
  const [consultMessage, setConsultMessage] = useState("");
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const validatePhone = (phone: string) => {
    // Accepts 10 digits (e.g., 0201234567) OR +233 followed by 9 digits (e.g., +233201234567)
    const phoneRegex = /^(\d{10}|\+233\d{9})$/;
    return phoneRegex.test(phone.replace(/\s/g, '')); // Remove spaces before checking
  };

  const handleEventBooking = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!eventType || !date || !selectedPackage || !name || !phone || !email || !guestCount) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!validatePhone(phone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await api.post('/bookings/', {
        guest_name: name,
        booking_type: `Event - ${eventType}`,
        date: `${format(date, "PPP")} | Package: ${selectedPackage} | Guests: ${guestCount} | Duration: ${duration} | Phone: ${phone} | Email: ${email} | Details: ${additionalDetails}`,
        status: "Pending"
      });

      setMessage({ type: 'success', text: 'Event booking request submitted successfully!' });
      setDate(undefined);
      setSelectedPackage(null);
      setEventType("");
      setGuestCount("");
      setName("");
      setPhone("");
      setEmail("");
      setAdditionalDetails("");
      setDuration("4 hours");
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Event booking error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to submit booking.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsultationSubmit = async () => {
    if (!consultName || !consultPhone || !consultEmail || !consultDate) {
      setMessage({ type: 'error', text: 'Please fill in all consultation fields.' });
      return;
    }

    if (!validatePhone(consultPhone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      await api.post('/bookings/', {
        guest_name: consultName,
        booking_type: 'Event Consultation',
        date: `${format(consultDate, "PPP")} | Phone: ${consultPhone} | Email: ${consultEmail} | Message: ${consultMessage}`,
        status: "Pending"
      });

      setMessage({ type: 'success', text: 'Consultation request submitted! We will contact you soon.' });
      setConsultName("");
      setConsultPhone("");
      setConsultEmail("");
      setConsultDate(undefined);
      setConsultMessage("");
      setIsConsultationOpen(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Consultation booking error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to submit consultation request.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={eventHallImg} alt="Event Hall" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-4">
              Celebrate Life's Moments
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Event Space</h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto">
              A magnificent venue for weddings, conferences, and celebrations of all kinds.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Success/Error Message */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-scale-in ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {message.text}
          </div>
        )}
        {/* Venue Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: "250+", label: "Guest Capacity" },
            { value: "1,000", label: "Square Meters" },
            { value: "24/7", label: "Availability" },
            { value: "75+", label: "Events Hosted" },
          ].map((stat, i) => (
            <Card key={i} className="text-center p-6 animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <div className="text-3xl font-display font-bold text-accent mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Packages */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">Event Packages</h2>
            <p className="section-subtitle mx-auto">Choose the perfect package for your celebration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {eventPackages.map((pkg, i) => (
              <Card
                key={pkg.name}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all hover:shadow-medium animate-fade-in",
                  selectedPackage === pkg.name && "ring-2 ring-accent",
                  pkg.popular && "ring-2 ring-accent"
                )}
                style={{ animationDelay: `${i * 100}ms` }}
                onClick={() => setSelectedPackage(pkg.name)}
              >
                {pkg.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-accent text-accent-foreground text-center py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                )}
                <CardContent className={cn("p-6", pkg.popular && "pt-10")}>
                  <h3 className="font-display text-2xl font-bold mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-bold">₵{pkg.price.toLocaleString()}</span>
                  </div>
                  <Badge variant="secondary" className="mb-4">
                    <Users className="w-3 h-3 mr-1" />
                    {pkg.capacity}
                  </Badge>
                  <ul className="space-y-2">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Booking Form */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Book Your Event</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Type</label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background"
                      value={eventType}
                      onChange={(e) => setEventType(e.target.value)}
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Guests</label>
                    <Input
                      type="number"
                      placeholder="Number of guests"
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus className="pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Event Duration</label>
                    <select
                      className="w-full h-11 px-3 rounded-lg border border-input bg-background"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    >
                      <option>4 hours</option>
                      <option>8 hours</option>
                      <option>Full day (12 hours)</option>
                      <option>Multiple days</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Selected Package</label>
                  <div className="flex gap-2 flex-wrap">
                    {eventPackages.map(pkg => (
                      <Button
                        key={pkg.name}
                        variant={selectedPackage === pkg.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPackage(pkg.name)}
                      >
                        {pkg.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Your Name</label>
                    <Input
                      placeholder="Dauda Kwame"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input
                      placeholder="+233 20 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@ghana.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Details</label>
                  <Textarea
                    placeholder="Tell us more about your event..."
                    rows={4}
                    value={additionalDetails}
                    onChange={(e) => setAdditionalDetails(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  variant="gold"
                  onClick={handleEventBooking}
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Submit Booking Request'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Add-ons */}
        <section>
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">Enhance Your Event</h2>
            <p className="section-subtitle mx-auto">Add extra services to make your event unforgettable</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {addOns.map((addon, i) => (
              <Card key={addon.name} className="text-center p-6 hover:shadow-medium transition-all cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <addon.icon className="w-10 h-10 mx-auto mb-3 text-accent" />
                <h4 className="font-semibold mb-1">{addon.name}</h4>
                <p className="text-sm text-muted-foreground">{addon.price}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact */}
        <Card className="mt-16 bg-primary text-primary-foreground">
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-bold mb-2">Need Help Planning?</h3>
              <p className="text-primary-foreground/80">Our event coordinators are ready to assist you.</p>
            </div>
            <div className="flex gap-4">
              <Button
                variant="hero"
                size="lg"
                onClick={() => window.location.href = 'tel:+233542101122'}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Us
              </Button>

              <Dialog open={isConsultationOpen} onOpenChange={setIsConsultationOpen}>
                <DialogTrigger asChild>
                  <Button variant="heroOutline" size="lg">
                    Schedule Consultation
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">Schedule a Consultation</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name</label>
                      <Input
                        placeholder="Dauda Kwame"
                        value={consultName}
                        onChange={(e) => setConsultName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number</label>
                      <Input
                        placeholder="+233 20 000 0000"
                        value={consultPhone}
                        onChange={(e) => setConsultPhone(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address</label>
                      <Input
                        type="email"
                        placeholder="you@ghana.com"
                        value={consultEmail}
                        onChange={(e) => setConsultEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preferred Date</label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !consultDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {consultDate ? format(consultDate, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={consultDate}
                            onSelect={setConsultDate}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message (Optional)</label>
                      <Textarea
                        placeholder="Tell us about your event needs..."
                        rows={3}
                        value={consultMessage}
                        onChange={(e) => setConsultMessage(e.target.value)}
                      />
                    </div>
                    <Button
                      className="w-full"
                      size="lg"
                      variant="gold"
                      onClick={handleConsultationSubmit}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Submitting...' : 'Request Consultation'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
