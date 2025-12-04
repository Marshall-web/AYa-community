import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Utensils, Radio } from "lucide-react";
import heroImage from "@/assets/hero-community.jpg";

const heroSlides = [
  {
    title: "Welcome to Our Community",
    subtitle: "Where Traditions Meet Modern Living",
    description: "Experience the warmth of community through exceptional dining, relaxation, and entertainment.",
    cta: "Explore Services",
    link: "#services",
  },
  {
    title: "Dine With Us",
    subtitle: "Authentic Flavors, Memorable Moments",
    description: "From traditional recipes to contemporary cuisine, our restaurant serves excellence on every plate.",
    cta: "View Menu",
    link: "/restaurant",
  },
  {
    title: "Host Your Event",
    subtitle: "Celebrate Life's Special Moments",
    description: "Our spacious event hall is perfect for weddings, conferences, and celebrations of all kinds.",
    cta: "Book Venue",
    link: "/events",
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Community Center"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div
            key={currentSlide}
            className="animate-fade-in"
          >
            <span className="inline-block px-4 py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-sm mb-6">
              {slide.subtitle}
            </span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
              {slide.title}
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-xl leading-relaxed">
              {slide.description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={slide.link}>
                <Button variant="hero" size="xl">
                  {slide.cta}
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="heroOutline" size="xl">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex gap-3 mt-12">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "w-12 bg-accent"
                    : "w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-4">
          {[
            { icon: Utensils, label: "Book Table", link: "/restaurant" },
            { icon: Calendar, label: "Book Event", link: "/events" },
            { icon: Radio, label: "Advertise", link: "/radio" },
          ].map((item, i) => (
            <Link
              key={i}
              to={item.link}
              className="group flex items-center gap-3 px-4 py-3 bg-primary-foreground/10 backdrop-blur-sm rounded-xl hover:bg-accent transition-all duration-300"
            >
              <item.icon className="w-5 h-5 text-primary-foreground group-hover:text-accent-foreground" />
              <span className="text-primary-foreground group-hover:text-accent-foreground font-medium text-sm">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Decorative Pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
