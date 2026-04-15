import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, Music, Users } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Community Cultural Night",
    date: "Dec 15, 2024",
    time: "6:00 PM",
    location: "Event Hall",
    icon: Music,
    color: "bg-accent",
  },
  {
    id: 2,
    title: "New Year's Eve Gala",
    date: "Dec 31, 2024",
    time: "8:00 PM",
    location: "Main Hall",
    icon: Users,
    color: "bg-terracotta",
  },
];

export function UpcomingEvents() {
  return (
    <section className="py-24 bg-card">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          {/* Left Content */}
          <div className="lg:w-1/2">
            <span className="inline-block px-4 py-2 bg-accent/10 rounded-full text-accent font-semibold text-sm mb-4">
              Upcoming Events
            </span>
            <h2 className="section-title mb-6">
              Join Our Community Events
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Stay connected with our vibrant community through exciting events,
              cultural celebrations, and entertainment programs throughout the year.
            </p>
            <Link to="/events">
              <Button variant="gold" size="lg">
                <Calendar className="w-5 h-5 mr-2" />
                View All Events
              </Button>
            </Link>
          </div>

          {/* Right - Event Cards */}
          <div className="lg:w-1/2 space-y-4 w-full">
            {events.map((event, index) => (
              <div
                key={event.id}
                className="flex items-center gap-4 p-4 bg-background rounded-2xl shadow-soft hover:shadow-medium transition-all hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className={`w-16 h-16 rounded-xl ${event.color} flex items-center justify-center shrink-0`}>
                  <event.icon className="w-7 h-7 text-card" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-lg font-semibold text-foreground truncate">
                    {event.title}
                  </h4>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {event.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
