import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Clock, Users, Activity, Shield, Check, Star,
  CreditCard, Target, Trophy, Play
} from "lucide-react";
import tennisCourtImg from "@/assets/tennis-court.jpg";
import volleyballCourtImg from "@/assets/volleyball-court.jpg";
import api from "@/lib/api";

const courtTypes = [
  { id: "tennis", name: "Tennis Court", icon: Target, color: "text-green-500" },
  { id: "volleyball", name: "Volleyball Court", icon: Trophy, color: "text-blue-500" },
];

const sessions = [
  { time: "6:00 AM - 8:00 AM", available: 2, price: 40 },
  { time: "8:00 AM - 10:00 AM", available: 2, price: 40 },
  { time: "10:00 AM - 12:00 PM", available: 1, price: 50 },
  { time: "2:00 PM - 4:00 PM", available: 2, price: 50 },
  { time: "4:00 PM - 6:00 PM", available: 1, price: 60 },
  { time: "6:00 PM - 8:00 PM", available: 2, price: 60 },
];

const packages = [
  {
    name: "Adult Membership",
    price: 450,
    period: "month",
    features: [
      "Unlimited court access",
      "Prime time booking priority",
      "Tournament participation",
      "Equipment rental included",
      "Locker access",
    ],
    popular: true
  },
  {
    name: "Family Package",
    price: 700,
    period: "month",
    features: [
      "Up to 4 family members",
      "Unlimited adult court access",
      "Kids playing ground access",
      "Weekend tournaments",
      "20% restaurant discount",
    ],
    popular: false
  },
];

const features = [
  { icon: Activity, title: "Professional Courts", description: "Well-maintained Tennis & Volleyball courts for adults" },
  { icon: Users, title: "Adults Only", description: "Tennis and Volleyball courts reserved for adults" },
  { icon: Play, title: "Kids Playing Ground", description: "Separate playing ground for kids activities" },
  { icon: Trophy, title: "Tournaments", description: "Regular competitions and events" },
];

export default function Sports() {
  const [date, setDate] = useState<Date>();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<"tennis" | "volleyball" | null>(null);
  const [participants, setParticipants] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const validatePhone = (phone: string) => {
    const phoneRegex = /^(\d{10}|\+233\d{9})$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleCourtBooking = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!date || !selectedSession || !selectedCourt || !fullName || !phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!validatePhone(phone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    const selectedSessionData = sessions.find(s => s.time === selectedSession);
    const totalPrice = (selectedSessionData?.price || 0) * participants;
    const courtName = selectedCourt === "tennis" ? "Tennis" : "Volleyball";
    const bookingType = `${courtName} Court Booking`;
    const bookingDate = format(date, "PPP");
    const bookingDetails = `Court: ${courtName} | Session: ${selectedSession} | Participants: ${participants}`;

    // Check availability before proceeding to payment
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/bookings/check_availability/', {
        booking_type: bookingType,
        date: `${bookingDate} at ${selectedSession}`,
      });

      if (!response.data.available) {
        setMessage({ 
          type: 'error', 
          text: response.data.message || 'This court session is already booked. Please select a different date/time.' 
        });
        setIsLoading(false);
        return;
      }

      // Navigate to payment page with booking data
      navigate("/payment", {
        state: {
          orderType: "booking",
          bookingType: bookingType,
          items: [{
            id: 1,
            name: `${courtName} Court - ${selectedSession}`,
            quantity: participants,
            price: selectedSessionData?.price || 0,
          }],
          total: totalPrice,
          bookingName: fullName,
          bookingPhone: phone,
          bookingDate: bookingDate,
          bookingTime: selectedSession,
          bookingDetails: bookingDetails,
        }
      });
    } catch (error: any) {
      console.error('Availability check error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to check availability. Please try again.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePackagePurchase = (packageName: string, price: number) => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!fullName || !phone) {
      setMessage({ type: 'error', text: 'Please enter your name and phone number first.' });
      return;
    }

    if (!validatePhone(phone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    // Navigate to payment page with package data
    navigate("/payment", {
      state: {
        orderType: "booking",
        bookingType: `Sports Package - ${packageName}`,
        items: [{
          id: 1,
          name: `Sports Package - ${packageName}`,
          quantity: 1,
          price: price,
        }],
        total: price,
        bookingName: fullName,
        bookingPhone: phone,
        bookingDetails: `Package: ${packageName}`,
      }
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={tennisCourtImg}
          alt="Sports Courts - Tennis and Volleyball"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-4">
              Stay Active & Healthy
            </span>
            <h1 className="font-display text-3xl md:text-6xl font-bold mb-4">Sports Activities</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-xl mx-auto">
              Tennis and Volleyball courts for adults. Kids have access to our playing ground.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Success/Error Message */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg animate-scale-in ${message.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            {message.text}
          </div>
        )}

        {/* Court Images Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="overflow-hidden hover:shadow-medium transition-all">
            <div className="h-64 overflow-hidden">
              <img
                src={tennisCourtImg}
                alt="Tennis Court"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-display font-semibold text-center">Tennis Court</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">Professional tennis court for adults</p>
            </CardContent>
          </Card>
          <Card className="overflow-hidden hover:shadow-medium transition-all">
            <div className="h-64 overflow-hidden">
              <img
                src={volleyballCourtImg}
                alt="Volleyball Court"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-display font-semibold text-center">Volleyball Court</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">Well-maintained volleyball court for adults</p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {features.map((feature, i) => (
            <Card key={i} className="text-center p-6 hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <feature.icon className="w-10 h-10 mx-auto mb-3 text-accent" />
              <h3 className="font-display font-semibold mb-1">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Court Booking */}
          <div>
            <h2 className="section-title text-3xl mb-2">Book a Court</h2>
            <p className="text-muted-foreground mb-6 text-sm">Tennis and Volleyball courts are available for adults only (18+ years)</p>

            <Card className="shadow-medium">
              <CardContent className="p-6 space-y-6">
                {/* Court Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Court</label>
                  <div className="grid grid-cols-2 gap-3">
                    {courtTypes.map((court) => {
                      const Icon = court.icon;
                      return (
                        <button
                          key={court.id}
                          onClick={() => setSelectedCourt(court.id as "tennis" | "volleyball")}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all",
                            selectedCourt === court.id
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/50"
                          )}
                        >
                          <Icon className={cn("w-8 h-8 mb-2", court.color)} />
                          <span className="font-medium text-sm">{court.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Date</label>
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

                {/* Session Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2">Select Session</label>
                  <div className="grid grid-cols-1 gap-2">
                    {sessions.map((session) => (
                      <button
                        key={session.time}
                        onClick={() => setSelectedSession(session.time)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 transition-all",
                          selectedSession === session.time
                            ? "border-accent bg-accent/10"
                            : "border-border hover:border-accent/50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{session.time}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={session.available < 2 ? "destructive" : "secondary"}>
                            {session.available} available
                          </Badge>
                          <span className="font-bold">₵{session.price.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Participants */}
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Participants</label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setParticipants(Math.max(1, participants - 1))}>-</Button>
                    <span className="text-2xl font-bold w-12 text-center">{participants}</span>
                    <Button variant="outline" size="icon" onClick={() => setParticipants(Math.min(10, participants + 1))}>+</Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input
                      placeholder="Dauda Kwame"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input
                      placeholder="+233 20 000 0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  variant="gold"
                  disabled={!date || !selectedSession || !selectedCourt}
                  onClick={handleCourtBooking}
                >
                  Proceed to Payment - ₵{selectedSession ? (sessions.find(s => s.time === selectedSession)?.price || 0) * participants : 0}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Packages */}
          <div>
            <h2 className="section-title text-3xl mb-6">Membership Packages</h2>

            <div className="space-y-4">
              {packages.map((pkg, i) => (
                <Card
                  key={pkg.name}
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-medium animate-fade-in",
                    pkg.popular && "ring-2 ring-accent"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {pkg.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-accent text-accent-foreground">
                        <Star className="w-3 h-3 mr-1" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold">{pkg.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-bold text-foreground">₵{pkg.price.toLocaleString()}</span>
                          <span className="text-muted-foreground">/{pkg.period}</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {pkg.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={pkg.popular ? "gold" : "outline"}
                      onClick={() => handlePackagePurchase(pkg.name, pkg.price)}
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Get {pkg.name} - ₵{pkg.price.toLocaleString()}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Kids Playing Ground Section */}
        <Card className="mt-16 bg-primary text-primary-foreground">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                <Play className="w-8 h-8 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold mb-2">Kids Playing Ground</h3>
                <p className="text-primary-foreground/80 mb-4">
                  We have a dedicated playing ground for kids where they can enjoy various activities and play games. 
                  The playing ground is available for children of all ages and provides a safe, supervised environment for fun and recreation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  {[
                    "Safe and supervised environment",
                    "Various playground activities",
                    "Open to all children",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-accent shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <p className="text-primary-foreground/80 mt-4 text-sm">
                  <strong>Note:</strong> Tennis and Volleyball courts are reserved for adults only. Kids can enjoy the playing ground with supervision.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety & Guidelines */}
        <Card className="mt-8 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              Court Rules & Guidelines (Adults Only)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Adults only (18+ years)",
                "Proper sports attire required",
                "Equipment available for rent",
                "Respect court booking times",
                "Follow coach instructions",
                "Report any injuries immediately",
                "No food on the courts",
                "Maintain sportsmanship",
              ].map((rule, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

