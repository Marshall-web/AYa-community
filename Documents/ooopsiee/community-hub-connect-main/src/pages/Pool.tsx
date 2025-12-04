import { useState } from "react";
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
import poolImg from "@/assets/pool.jpg";

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
    features: ["Single day access", "Locker included", "Towel service"],
    popular: false
  },
  { 
    name: "Monthly", 
    price: 250, 
    period: "month",
    features: ["Unlimited sessions", "Free locker", "10% restaurant discount", "Guest pass (2x)"],
    popular: true
  },
  { 
    name: "Annual", 
    price: 2000, 
    period: "year",
    features: ["Unlimited access", "Premium locker", "20% all discounts", "Free swim lessons", "Priority booking"],
    popular: false
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
  const [swimmers, setSwimmers] = useState(1);

  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px]">
        <img src={poolImg} alt="Swimming Pool" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-4">
              Dive Into Relaxation
            </span>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">Swimming Pool</h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto">
              Crystal clear waters await. Book a session or become a member today.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
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
                          <Badge variant={session.available < 10 ? "destructive" : "secondary"}>
                            {session.available} spots
                          </Badge>
                          <span className="font-bold">₵{session.price.toLocaleString()}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Number of Swimmers */}
                <div>
                  <label className="block text-sm font-medium mb-2">Number of Swimmers</label>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => setSwimmers(Math.max(1, swimmers - 1))}>-</Button>
                    <span className="text-2xl font-bold w-12 text-center">{swimmers}</span>
                    <Button variant="outline" size="icon" onClick={() => setSwimmers(Math.min(10, swimmers + 1))}>+</Button>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <Input placeholder="Kwame Mensah" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <Input placeholder="+233 20 000 0000" />
                  </div>
                </div>

                <Button className="w-full" size="lg" variant="gold" disabled={!date || !selectedSession}>
                  Book Session - ₵{selectedSession ? (sessions.find(s => s.time === selectedSession)?.price || 0) * swimmers : 0}
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
                    "relative overflow-hidden transition-all hover:shadow-medium animate-fade-in",
                    membership.popular && "ring-2 ring-accent"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {membership.popular && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-accent text-accent-foreground">
                        <Star className="w-3 h-3 mr-1" /> Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-display text-xl font-bold">{membership.name}</h3>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-bold text-foreground">₵{membership.price.toLocaleString()}</span>
                          <span className="text-muted-foreground">/{membership.period}</span>
                        </div>
                      </div>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {membership.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-accent" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={membership.popular ? "gold" : "outline"}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Get {membership.name}
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
