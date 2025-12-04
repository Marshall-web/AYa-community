import { useState } from "react";
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
import eventHallImg from "@/assets/event-hall.jpg";

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
        {/* Venue Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { value: "500+", label: "Guest Capacity" },
            { value: "5,000", label: "Square Meters" },
            { value: "24/7", label: "Availability" },
            { value: "100+", label: "Events Hosted" },
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
                    <Input type="number" placeholder="Number of guests" />
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
                    <select className="w-full h-11 px-3 rounded-lg border border-input bg-background">
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
                    <Input placeholder="Kwame Mensah" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone Number</label>
                    <Input placeholder="+233 20 000 0000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Email Address</label>
                  <Input type="email" placeholder="you@ghana.com" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Additional Details</label>
                  <Textarea placeholder="Tell us more about your event..." rows={4} />
                </div>

                <Button className="w-full" size="lg" variant="gold">
                  Submit Booking Request
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
              <Button variant="hero" size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Call Us
              </Button>
              <Button variant="heroOutline" size="lg">
                Schedule Consultation
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
