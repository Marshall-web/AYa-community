import { useState, useEffect } from "react";
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
import gymImg from "@/assets/gym.avif";
import kidsPlayingImg from "@/assets/kids-playing.avif";
import playinggroundImg from "@/assets/playingground.webp";
import childrenPlayingImg from "@/assets/children-playing.jpg";
import api from "@/lib/api";

const courtTypes = [
  { id: "tennis", name: "Tennis Court", icon: Target, color: "text-green-500" },
  { id: "volleyball", name: "Volleyball Court", icon: Trophy, color: "text-blue-500" },
];

const sessions = [
  { time: "6:00 AM - 8:00 AM", price: 40 },
  { time: "8:00 AM - 10:00 AM", price: 40 },
  { time: "10:00 AM - 12:00 PM", price: 50 },
  { time: "2:00 PM - 4:00 PM", price: 50 },
  { time: "4:00 PM - 6:00 PM", price: 60 },
  { time: "6:00 PM - 8:00 PM", price: 60 },
];

const packages = [
  {
    name: "Daily Gym Pass",
    price: 20,
    period: "day",
    features: [
      "Full gym access for 24h",
      "Locker & Shower access",
      "Standard equipment use",
      "Free WiFi",
      "No commitment"
    ],
    popular: false,
    savings: "Perfect for trials & visitors",
    badge: "Flexibility",
    value: "₵20/day"
  },
  {
    name: "Gym Membership",
    price: 200,
    period: "month",
    features: [
      "Full gym access",
      "Personal trainer consultation",
      "Locker & Shower access",
      "Fitness classes included",
      "Progress tracking",
      "Member exclusive events"
    ],
    popular: true,
    savings: "Save ₵400 vs daily passes",
    badge: "Best Value",
    value: "₵6.6/day"
  },
  {
    name: "Annual Sports Pass",
    price: 3000,
    period: "year",
    features: [
      "All gym + court access",
      "Priority court booking",
      "Free tournament participation",
      "Personal trainer sessions (12x/year)",
      "VIP member events",
      "20% discount on all programs"
    ],
    popular: false,
    savings: "Save ₵600 vs monthly",
    badge: "Premium",
    value: "₵8/day"
  },
];

const features = [
  { icon: Activity, title: "Modern Gym", description: "State-of-the-art weights and cardio equipment" },
  { icon: Target, title: "Pro Courts", description: "Well-maintained Tennis & Volleyball courts" },
  { icon: Play, title: "Kids Zone", description: "Exciting and safe playing ground for minors" },
  { icon: Trophy, title: "Competitions", description: "Regular tournaments and fitness challenges" },
];

export default function Sports() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [date, setDate] = useState<Date>();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<"tennis" | "volleyball" | null>(null);
  // const [participants, setParticipants] = useState(1); // Removed as per request
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Tournament Form State
  const [tournamentData, setTournamentData] = useState({
    name: "",
    email: "",
    phone: "",
    description: "",
    sportType: "Tennis" as "Tennis" | "Volleyball",
  });
  const [tournamentDate, setTournamentDate] = useState<Date>();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

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
    const totalPrice = selectedSessionData?.price || 0;
    const courtName = selectedCourt === "tennis" ? "Tennis" : "Volleyball";
    const bookingType = `${courtName} session`;
    const bookingDate = format(date, "PPP");
    const bookingDetails = `Court: ${courtName} | Session: ${selectedSession}`;

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
          text: response.data.message || 'This court session is already booked. Both tennis and volleyball use the same court, so please select a different time slot.'
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
            quantity: 1,
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

  const handleTournamentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tournamentData.name || !tournamentData.email || !tournamentData.phone || !tournamentDate) {
      setMessage({ type: 'error', text: 'Please fill in all required fields for the tournament.' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/bookings/', {
        guest_name: tournamentData.name,
        booking_type: `Tournament Request (${tournamentData.sportType})`,
        date: `${format(tournamentDate, "PPP")} | Phone: ${tournamentData.phone} | Email: ${tournamentData.email} | Info: ${tournamentData.description}`,
        status: "Pending"
      });
      setMessage({ type: 'success', text: 'Tournament request submitted! We will contact you soon.' });
      setTournamentData({ name: "", email: "", phone: "", description: "", sportType: "Tennis" });
      setTournamentDate(undefined);
    } catch (error: any) {
      setMessage({ type: 'error', text: 'Failed to submit request. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] md:h-[65vh] min-h-[400px] md:min-h-[500px] overflow-hidden">
        <div className="absolute inset-0 flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {[tennisCourtImg, volleyballCourtImg, gymImg, kidsPlayingImg].map((img, i) => (
            <img key={i} src={img} alt="Sports Facility" className="w-[100%] h-full object-cover shrink-0" />
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground px-4">
            <span className="inline-block px-4 py-1.5 md:py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-[10px] md:text-sm mb-3 md:mb-4 uppercase tracking-wider">
              AYA Fitness & Sports
            </span>
            <h1 className="font-display text-3xl md:text-7xl font-bold mb-2 md:mb-4 drop-shadow-lg leading-tight">Sports & Wellness</h1>
            <p className="text-sm md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto drop-shadow-md leading-relaxed">
              Professional courts, a modern community gym, and a safe playing zone for children.
            </p>
          </div>
        </div>
        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={cn(
                "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                currentSlide === i ? "bg-accent w-6 md:w-8" : "bg-white/50"
              )}
            />
          ))}
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

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <Card className="overflow-hidden hover:shadow-medium transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img src={tennisCourtImg} alt="Tennis" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold">Tennis</span>
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden hover:shadow-medium transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img src={volleyballCourtImg} alt="Volleyball" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold">Volleyball</span>
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden hover:shadow-medium transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img src={gymImg} alt="Gym" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold">Gym</span>
              </div>
            </div>
          </Card>
          <Card className="overflow-hidden hover:shadow-medium transition-all group">
            <div className="h-48 overflow-hidden relative">
              <img src={kidsPlayingImg} alt="Playing Ground" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold">Kids Zone</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12 md:mb-16">
          {features.map((feature, i) => (
            <Card key={i} className="text-center p-4 md:p-6 hover:shadow-medium transition-all animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
              <feature.icon className="w-8 h-8 md:w-10 md:h-10 mx-auto mb-2 md:mb-3 text-accent" />
              <h3 className="font-display font-bold text-xs md:text-base mb-1">{feature.title}</h3>
              <p className="text-[10px] md:text-sm text-muted-foreground leading-tight">{feature.description}</p>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Court & Gym Booking */}
          <div>
            <h2 className="section-title text-3xl mb-2">Book a Session</h2>
            <p className="text-muted-foreground mb-6 text-sm">Select a court or gym time for your workout</p>

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
                      <Calendar mode="single" selected={date} onSelect={setDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="pointer-events-auto" />
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
                          <span className="font-bold">₵{session.price.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
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
                  Proceed to Payment - ₵{selectedSession ? (sessions.find(s => s.time === selectedSession)?.price || 0) : 0}
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
                    "relative overflow-hidden transition-all hover:shadow-medium hover:scale-102 animate-fade-in group cursor-pointer",
                    pkg.popular && "ring-2 ring-accent shadow-lg"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {pkg.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg animate-pulse">
                        <Star className="w-3 h-3 mr-1" /> {pkg.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4 md:p-6">
                    {/* Value Badge */}
                    {!pkg.popular && pkg.badge && (
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="secondary" className="text-[10px] md:text-xs font-bold px-1.5 py-0">
                          {pkg.badge}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg md:text-xl font-bold mb-1 md:mb-2 group-hover:text-accent transition-colors">
                          {pkg.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 md:gap-2">
                          <span className="text-2xl md:text-3xl font-bold text-foreground">₵{pkg.price.toLocaleString()}</span>
                          <span className="text-sm md:text-lg text-muted-foreground">/{pkg.period}</span>
                        </div>
                        {pkg.savings && (
                          <div className="text-[10px] md:text-sm text-green-600 font-bold mt-1 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">
                            {pkg.savings}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground mb-1">Effective</div>
                        <div className="text-lg md:text-2xl font-bold text-accent">
                          {pkg.value}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                      {pkg.features.map((feature, index) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-center gap-2 md:gap-3 text-xs md:text-sm transition-all",
                            "animate-fade-in"
                          )}
                          style={{ animationDelay: `${(i * 100) + (index * 50)}ms` }}
                        >
                          <div className="w-4 h-4 md:w-6 md:h-6 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <Check className="w-2 md:w-3 text-accent" />
                          </div>
                          <span className="flex-1 line-clamp-1 md:line-clamp-none">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        "w-full transition-all hover:scale-105",
                        pkg.popular
                          ? "bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg hover:from-accent hover:to-accent hover:text-white"
                          : "border-2 border-accent/20 hover:border-accent hover:bg-accent/10"
                      )}
                      variant={pkg.popular ? "default" : "outline"}
                      onClick={() => handlePackagePurchase(pkg.name, pkg.price)}
                    >
                      <CreditCard className={cn(
                        "w-4 h-4 mr-2 transition-transform group-hover:scale-110",
                        pkg.popular ? "text-white" : "text-accent"
                      )} />
                      <span className={pkg.popular ? "text-white" : "text-foreground"}>
                        Get {pkg.name} - ₵{pkg.price.toLocaleString()}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Kids Playing Ground Section */}
        <Card className="mt-16 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="h-64 lg:h-auto overflow-hidden">
              <img src={playinggroundImg} alt="Kids playing ground" className="w-full h-full object-cover" />
            </div>
            <CardContent className="p-8 bg-primary text-primary-foreground">
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Play className="w-8 h-8 text-accent" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display text-2xl font-bold mb-2">Kids Playing Area</h3>
                  <p className="text-primary-foreground/80 mb-4">
                    AYA Community Center provides an extensive playing ground for children. It's a safe, vibrant space designed for supervised fun.
                  </p>
                  <div className="space-y-3 mt-6">
                    {[
                      { icon: Shield, text: "Safe and supervised environment" },
                      { icon: Activity, text: "Modern playground equipment" },
                      { icon: Users, text: "Open to all community children" },
                    ].map((feat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <feat.icon className="w-5 h-5 text-accent shrink-0" />
                        <span className="text-sm">{feat.text}</span>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <img src={childrenPlayingImg} alt="Children playing" className="rounded-lg border-2 border-accent/20 h-24 w-full object-cover" />
                    <img src={kidsPlayingImg} alt="Kids activity" className="rounded-lg border-2 border-accent/20 h-24 w-full object-cover" />
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Tournament Request Form */}
        <section className="mt-16 bg-white dark:bg-zinc-900 border border-border rounded-2xl overflow-hidden shadow-medium">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 lg:p-12 bg-accent text-accent-foreground flex flex-col justify-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Host a Tournament</h2>
              <p className="text-accent-foreground/80 mb-8 max-w-md">
                Looking to organize a professional tournament or community sports event?
                Our team can help you with scheduling, equipment, and logistics.
              </p>
              <div className="space-y-4">
                {[
                  "Exclusive court access",
                  "Official score boards and seating",
                  "Event planning assistance",
                  "Special group rates available"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Check className="w-5 h-5 opacity-70" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <form onSubmit={handleTournamentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      placeholder="Organization or Name"
                      value={tournamentData.name}
                      onChange={(e) => setTournamentData({ ...tournamentData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Phone</label>
                    <Input
                      placeholder="+233..."
                      value={tournamentData.phone}
                      onChange={(e) => setTournamentData({ ...tournamentData, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={tournamentData.email}
                    onChange={(e) => setTournamentData({ ...tournamentData, email: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Type of Sport</label>
                    <div className="flex gap-2">
                      {["Tennis", "Volleyball"].map((sport) => (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => setTournamentData({ ...tournamentData, sportType: sport as any })}
                          className={cn(
                            "flex-1 py-2 px-4 rounded-lg border text-sm transition-all",
                            tournamentData.sportType === sport
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-input hover:border-primary/50"
                          )}
                        >
                          {sport}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Proposed Tournament Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !tournamentDate && "text-muted-foreground")}>
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {tournamentDate ? format(tournamentDate, "PPP") : "Select a possible date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={tournamentDate} onSelect={setTournamentDate} disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus className="pointer-events-auto" />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tournament Details</label>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm"
                    placeholder="Tell us about the tournament (expected participants, duration, etc.)"
                    value={tournamentData.description}
                    onChange={(e) => setTournamentData({ ...tournamentData, description: e.target.value })}
                  />
                </div>
                <Button type="submit" className="w-full" size="lg" variant="gold" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Send Tournament Request"}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Safety & Guidelines */}
        <Card className="mt-8 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              Court Rules & Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[

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

