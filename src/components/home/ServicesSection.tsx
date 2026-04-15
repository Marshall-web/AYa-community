import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Utensils, Waves, Calendar, Activity, Heart } from "lucide-react";
import restaurantImg from "@/assets/Dinning-Space.jpg";
import poolImg from "@/assets/Pool.jpg";
import eventHallImg from "@/assets/Event-space.jpg";
import elderlyCareImg from "@/assets/Aya-elderly-care.webp";
import backgroundImg from "@/assets/background.jpg";

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
    description: "Host unforgettable events in our spacious hall. Perfect for weddings, conferences, meetings, and celebrations.",
    image: eventHallImg,
    icon: Calendar,
    link: "/events",
    cta: "Book Venue",
    features: ["500+ Capacity", "Catering Available", "Event Planning"],
  },
  {
    id: "sports",
    title: "Sports Activities",
    description: "Tennis and Volleyball courts for adults. Kids have access to our playing ground for various activities.",
    image: backgroundImg,
    icon: Activity,
    link: "/sports",
    cta: "Book Court",
    features: ["Tennis & Volleyball (Adults)", "Kids Playing Ground", "Membership Packages"],
  },
  {
    id: "elderly-care",
    title: "Elderly Care Center",
    description: "Comprehensive healthcare services for our elderly community. Health checkups, medication management, and more.",
    image: elderlyCareImg,
    icon: Heart,
    link: "/elderly-care",
    cta: "Learn More",
    features: ["Free Day Care", "Health Checkups", "Care Packages"],
  },
];

export function ServicesSection() {
  return (
    <section id="services" className="py-12 md:py-24 bg-warm-gradient pattern-dots">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-16">
          <span className="inline-block px-4 py-1.5 md:py-2 bg-accent/10 rounded-full text-accent font-semibold text-[10px] md:text-sm mb-3 md:mb-4 uppercase tracking-wider">
            Our Services
          </span>
          <h2 className="section-title mb-4">
            Everything Your Community Needs
          </h2>
          <p className="section-subtitle mx-auto px-4">
            From dining to entertainment, we provide exceptional services that bring our community together.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {services.map((service, index) => (
            <Link
              key={service.id}
              to={service.link}
              className="service-card group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image */}
              <div className="relative h-48 md:h-64 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center gap-3 text-primary-foreground">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent flex items-center justify-center shadow-lg">
                      <service.icon className="w-5 h-5 md:w-6 md:h-6 text-accent-foreground" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold">{service.title}</h3>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 md:p-6">
                <p className="text-sm md:text-base text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6">
                  {service.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2.5 py-0.5 md:px-3 md:py-1 bg-secondary rounded-full text-[10px] md:text-sm text-secondary-foreground font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <div className="flex items-center text-accent font-bold text-sm md:text-base group-hover:gap-3 transition-all">
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
