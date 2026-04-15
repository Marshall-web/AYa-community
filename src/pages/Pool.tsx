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
  CalendarIcon, Clock, Users, Waves, Shield, Sun,
  Check, Star, CreditCard
} from "lucide-react";
import poolAreaImg from "@/assets/Pool-Area.jpg";
import poolDayImg from "@/assets/Pool-Day.jpg";
import poolPrimaryImg from "@/assets/Pool.jpg";
import pool2Img from "@/assets/Pool2.jpg";
import pool3Img from "@/assets/pool3.jpg";
import nightPoolImg from "@/assets/Night-pool.jpg";
import api from "@/lib/api";

const poolSlides = [
  { src: poolAreaImg, alt: "Pool Area" },
  { src: poolDayImg, alt: "Pool Day" },
  { src: poolPrimaryImg, alt: "Main Pool" },
  { src: pool2Img, alt: "Clear Waters" },
  { src: pool3Img, alt: "Poolside Perspective" },
  { src: nightPoolImg, alt: "Pool at Night" },
];

const sessions = [
  { time: "6:00 AM - 8:00 AM", available: 15, price: 20 },
  { time: "8:00 AM - 10:00 AM", available: 8, price: 20 },
  { time: "10:00 AM - 12:00 PM", available: 20, price: 25 },
  { time: "2:00 PM - 4:00 PM", available: 25, price: 25 },
  { time: "4:00 PM - 6:00 PM", available: 5, price: 30 },
  { time: "6:00 PM - 8:00 PM", available: 12, price: 30 },
];

const memberships = [
  {
    name: "Daily Pass",
    price: 30,
    period: "day",
    features: ["Single day access", "Locker included", "Towel service", "Free WiFi"],
    popular: false,
    savings: "Perfect for visitors",
    badge: "Flexibility"
  },
  {
    name: "Monthly",
    price: 250,
    period: "month",
    features: ["Unlimited sessions", "Free locker", "10% restaurant discount", "Guest pass (2x)", "Priority booking"],
    popular: true,
    savings: "Save ₵110 vs daily passes",
    badge: "Best Value"
  },
  {
    name: "Annual",
    price: 2000,
    period: "year",
    features: ["Unlimited access", "Premium locker", "20% all discounts", "Free swim lessons", "Priority booking", "VIP events"],
    popular: false,
    savings: "Save ₵1,000 vs monthly",
    badge: "Big Savings"
  },
];

const features = [
  { icon: Waves, title: "Olympic-Size Pool", description: "50m heated pool with 8 lanes" },
  { icon: Sun, title: "Outdoor Deck", description: "Lounge chairs and umbrellas" },
  { icon: Shield, title: "Lifeguards", description: "Trained staff on duty" },
  { icon: Users, title: "Swim Classes", description: "For all ages and levels" },
];

export default function Pool() {
  const [date, setDate] = useState<Date>();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % poolSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const [counts, setCounts] = useState({
    adults: 1,
    teenagers: 0,
    children: 0
  });

  const prices = {
    adults: 30,
    teenagers: 20,
    children: 15
  };

  const totalSwimmers = counts.adults + counts.teenagers + counts.children;
  const totalPrice = (counts.adults * prices.adults) +
    (counts.teenagers * prices.teenagers) +
    (counts.children * prices.children);

  // Form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  // Loading and message state
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
    // Accepts 10 digits (e.g., 0201234567) OR +233 followed by 9 digits (e.g., +233201234567)
    const phoneRegex = /^(\d{10}|\+233\d{9})$/;
    return phoneRegex.test(phone.replace(/\s/g, '')); // Remove spaces before checking
  };

  const handleSessionBooking = async () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    if (!date || !selectedSession || !fullName || !phone) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (!validatePhone(phone)) {
      setMessage({ type: 'error', text: 'Invalid phone number. Use 10 digits (020...) or +233 format.' });
      return;
    }

    // Validate swimmers count
    if (totalSwimmers < 1 || totalSwimmers > 20) {
      setMessage({ type: 'error', text: 'Total number of swimmers must be between 1 and 20.' });
      return;
    }

    const bookingDate = format(date, "PPP");
    const bookingDetails = `Session: ${selectedSession} | ${counts.adults} Adults, ${counts.teenagers} Teens, ${counts.children} Children`;

    // Check availability before proceeding to payment
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await api.post('/bookings/check_availability/', {
        booking_type: "Pool Session",
        date: `${bookingDate} at ${selectedSession}`,
        slots: totalSwimmers,
      });

      if (!response.data.available) {
        setMessage({
          type: 'error',
          text: response.data.message || 'This pool session is already booked. Please select a different date/time.'
        });
        setIsLoading(false);
        return;
      }

      // Prepare items for payment
      const checkoutItems = [];
      if (counts.adults > 0) checkoutItems.push({ id: 'pool-adult', name: 'Pool Session (Adult)', quantity: counts.adults, price: prices.adults });
      if (counts.teenagers > 0) checkoutItems.push({ id: 'pool-teen', name: 'Pool Session (Teenager)', quantity: counts.teenagers, price: prices.teenagers });
      if (counts.children > 0) checkoutItems.push({ id: 'pool-child', name: 'Pool Session (Child)', quantity: counts.children, price: prices.children });

      // Navigate to payment page with booking data
      navigate("/payment", {
        state: {
          orderType: "booking",
          bookingType: "Pool Session",
          items: checkoutItems,
          total: totalPrice,
          bookingName: fullName,
          bookingPhone: phone,
          bookingDate: bookingDate,
          bookingTime: selectedSession,
          bookingDetails: bookingDetails,
          slots: totalSwimmers,
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

  const handleMembershipPurchase = (membershipName: string, price: number) => {
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

    // Navigate to payment page with membership data
    navigate("/payment", {
      state: {
        orderType: "booking",
        bookingType: `Pool Membership - ${membershipName}`,
        items: [{
          id: 1,
          name: `Pool Membership - ${membershipName}`,
          quantity: 1,
          price: price,
        }],
        total: price,
        bookingName: fullName,
        bookingPhone: phone,
        bookingDetails: `Membership: ${membershipName}`,
      }
    });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[40vh] md:h-[50vh] min-h-[300px] md:min-h-[400px] overflow-hidden">
        {poolSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={slide.src}
              alt={slide.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-1.5 md:py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-[10px] md:text-sm mb-3 md:mb-4 uppercase tracking-wider">
              Dive Into Relaxation
            </span>
            <h1 className="font-display text-2xl md:text-6xl font-bold mb-2 md:mb-4">Swimming Pool</h1>
            <p className="text-sm md:text-xl text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Crystal clear waters await. Book a session or become a member today.
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
          {/* Session Booking */}
          <div>
            <h2 className="section-title text-3xl mb-6">Book a Session</h2>

            <Card className="shadow-medium">
              <CardContent className="p-6 space-y-6">
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
                          <Badge variant={session.available < 10 ? "destructive" : "secondary"}>
                            {session.available} spots
                          </Badge>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dynamic Counter for Different Tiers */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm">Adults</h4>
                      <p className="text-[10px] text-muted-foreground">₵30 per person</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCounts(c => ({ ...c, adults: Math.max(0, c.adults - 1) }))}>-</Button>
                      <span className="font-black w-4 text-center">{counts.adults}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCounts(c => ({ ...c, adults: Math.min(10, c.adults + 1) }))}>+</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm">Teenagers</h4>
                      <p className="text-[10px] text-muted-foreground">₵20 per person</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCounts(c => ({ ...c, teenagers: Math.max(0, c.teenagers - 1) }))}>-</Button>
                      <span className="font-black w-4 text-center">{counts.teenagers}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCounts(c => ({ ...c, teenagers: Math.min(10, c.teenagers + 1) }))}>+</Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                    <div>
                      <h4 className="font-bold text-sm">Children</h4>
                      <p className="text-[10px] text-muted-foreground">₵15 per person</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCounts(c => ({ ...c, children: Math.max(0, c.children - 1) }))}>-</Button>
                      <span className="font-black w-4 text-center">{counts.children}</span>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" onClick={() => setCounts(c => ({ ...c, children: Math.min(10, c.children + 1) }))}>+</Button>
                    </div>
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
                  className="w-full h-12 rounded-xl"
                  size="lg"
                  variant="gold"
                  disabled={!date || !selectedSession || totalSwimmers === 0}
                  onClick={handleSessionBooking}
                >
                  Confirm Booking - ₵{totalPrice.toLocaleString()}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Memberships */}
          <div>
            <h2 className="section-title text-3xl mb-6">Memberships</h2>

            <div className="space-y-4">
              {memberships.map((membership, i) => (
                <Card
                  key={membership.name}
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-medium hover:scale-105 animate-fade-in group cursor-pointer",
                    membership.popular && "ring-2 ring-accent shadow-lg"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {membership.popular && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg animate-pulse">
                        <Star className="w-3 h-3 mr-1" /> {membership.badge}
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-4 md:p-6 relative">
                    {/* Value Badge */}
                    {!membership.popular && membership.badge && (
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="secondary" className="text-[10px] md:text-xs font-bold px-1.5 py-0">
                          {membership.badge}
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3 md:mb-4">
                      <div className="flex-1">
                        <h3 className="font-display text-lg md:text-xl font-bold mb-1 md:mb-2 group-hover:text-accent transition-colors">
                          {membership.name}
                        </h3>
                        <div className="flex items-baseline gap-1.5 md:gap-2">
                          <span className="text-2xl md:text-3xl font-bold text-foreground">₵{membership.price.toLocaleString()}</span>
                          <span className="text-sm md:text-lg text-muted-foreground">/{membership.period}</span>
                        </div>
                        {membership.savings && (
                          <div className="text-[10px] md:text-sm text-green-600 font-bold mt-1 bg-green-500/10 px-2 py-0.5 rounded-full inline-block">
                            {membership.savings}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-muted-foreground mb-1">Per {membership.period}</div>
                        <div className="text-lg md:text-2xl font-bold text-accent">
                          ₵{Math.round(membership.price / (membership.period === 'day' ? 1 : membership.period === 'month' ? 30 : 365)).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-1.5 md:space-y-2 mb-4 md:mb-6">
                      {membership.features.map((feature, index) => (
                        <li
                          key={feature}
                          className={cn(
                            "flex items-center gap-2 md:gap-3 text-xs md:text-sm transition-all",
                            "animate-fade-in"
                          )}
                          style={{ animationDelay: `${(i * 100) + (index * 50)}ms` }}
                        >
                          <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                            <Check className="w-2 md:w-3 text-accent" />
                          </div>
                          <span className="flex-1 line-clamp-1 md:line-clamp-none">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        "w-full transition-all hover:scale-105",
                        membership.popular
                          ? "bg-gradient-to-r from-accent to-accent/80 text-white shadow-lg hover:from-accent hover:to-accent hover:text-white"
                          : "border-2 border-accent/20 hover:border-accent hover:bg-accent/10"
                      )}
                      variant={membership.popular ? "default" : "outline"}
                      onClick={() => handleMembershipPurchase(membership.name, membership.price)}
                    >
                      <CreditCard className={cn(
                        "w-4 h-4 mr-2 transition-transform group-hover:scale-110",
                        membership.popular ? "text-white" : "text-accent"
                      )} />
                      <span className={membership.popular ? "text-white" : "text-foreground"}>
                        Get {membership.name} - ₵{membership.price.toLocaleString()}
                      </span>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Safety Guidelines */}
        <Card className="mt-16 bg-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-accent" />
              Pool Safety Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                "Shower before entering the pool",
                "Children under 12 must be supervised",
                "No diving in shallow areas",
                "No food or drinks in pool area",
                "Follow lifeguard instructions",
                "Report any injuries immediately",
                "Proper swimwear required",
                "No running on pool deck",
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
