import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Waves, Calendar, Radio } from "lucide-react";
import restaurantImg from "@/assets/restaurant.jpg";
import poolImg from "@/assets/pool.jpg";
import eventHallImg from "@/assets/event-hall.jpg";
import radioImg from "@/assets/radio-station.jpg";

const services = [
  {
    id: "restaurant",
    title: "Restaurant",
    description: "Savor authentic cuisine and contemporary dishes in an elegant setting. Book a table or order for delivery.",
    image: restaurantImg,
    icon: Utensils,
    link: "/restaurant",
    cta: "View Menu",
    features: ["Fine Dining", "Food Delivery", "Private Events"],
  },
  {
    id: "pool",
    title: "Swimming Pool",
    description: "Dive into relaxation at our pristine pool. Book sessions for the whole family or get a membership.",
    image: poolImg,
    icon: Waves,
    link: "/pool",
    cta: "Book Session",
    features: ["Family Friendly", "Swim Lessons", "Memberships"],
  },
  {
    id: "events",
    title: "Event Space",
    description: "Host unforgettable events in our spacious hall. Perfect for weddings, conferences, and celebrations.",
    image: eventHallImg,
    icon: Calendar,
    link: "/events",
    cta: "Book Venue",
    features: ["500+ Capacity", "Catering Available", "Event Planning"],
  },
  {
    id: "radio",
    title: "Radio Station",
    description: "Connect with the community through our radio station. Advertise your business or tune in daily.",
    image: radioImg,
    icon: Radio,
    link: "/radio",
    cta: "Advertise Now",
    features: ["24/7 Broadcast", "Ad Slots", "Live Shows"],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-warm-gradient pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-2 bg-accent/10 rounded-full text-accent font-semibold text-sm mb-4">
            Our Services
          </span>
          <h2 className="section-title mb-4">
            Everything Your Community Needs
          </h2>
          <p className="section-subtitle mx-auto">
            From dining to entertainment, we provide exceptional services that bring our community together.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <Link
              key={service.id}
              to={service.link}
              className="service-card"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 text-primary-foreground">
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-2xl font-bold">{service.title}</h3>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-accent font-semibold group-hover:gap-3 transition-all">
                  {service.cta}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
