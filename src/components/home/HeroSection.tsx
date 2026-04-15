import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Calendar, Utensils } from "lucide-react";

// Import new assets
import gateImg from "@/assets/gate1.jpg";
import ayaImg from "@/assets/AYA.jpg";
import diningImg from "@/assets/Dinning-Space.jpg";
import poolImg from "@/assets/Pool-Area.jpg";
import eventImg from "@/assets/Event-space.jpg";
import fountainImg from "@/assets/Fountain.jpg";
import hutImg from "@/assets/Hut.jpg";
import nightPoolImg from "@/assets/Night-pool.jpg";
import boardImg from "@/assets/Board.jpg";
import diningTableImg from "@/assets/Dinning-Table.jpg";
import poolDayImg from "@/assets/Pool-Day.jpg";
import hut1Img from "@/assets/Hut1.jpg";
import fountain2Img from "@/assets/foutain2.jpg";
import pool2Img from "@/assets/Pool2.jpg";

const heroSlides = [
  {
    title: "Welcome to AYA Community Center",
    subtitle: "Where Traditions Meet Modern Living",
    description: "Experience the warmth of community through exceptional dining, relaxation, and entertainment.",
    cta: "Explore Services",
    link: "#services",
    image: gateImg,
  },
  {
    title: "Dine With Us",
    subtitle: "Authentic Flavors, Memorable Moments",
    description: "From traditional recipes to contemporary cuisine, our restaurant serves excellence on every plate.",
    cta: "View Menu",
    link: "/restaurant",
    image: diningImg,
  },
  {
    title: "The Heart of AYA",
    subtitle: "A Place of Togetherness",
    description: "Discover the vibrant spirit of our community hub, where everyone is welcome.",
    cta: "Learn More",
    link: "#services",
    image: ayaImg,
  },
  {
    title: "Cool Down at the Pool",
    subtitle: "Refresh, Relax, Recharge",
    description: "Enjoy our crystal clear waters and serene environment for the perfect afternoon escape.",
    cta: "Pool Services",
    link: "/pool",
    image: poolImg,
  },
  {
    title: "Host Your Event",
    subtitle: "Celebrate Life's Special Moments",
    description: "Our spacious event hall is perfect for weddings, conferences, and celebrations of all kinds.",
    cta: "Book Venue",
    link: "/events",
    image: eventImg,
  },
  {
    title: "Serene Landscapes",
    subtitle: "Peaceful Moments by the Fountain",
    description: "Take a stroll through our beautifully landscaped grounds and find your inner peace.",
    cta: "Explore Grounds",
    link: "#services",
    image: fountainImg,
  },
  {
    title: "Traditional Comforts",
    subtitle: "Authentic African Living",
    description: "Experience the unique charm of our traditional huts, designed for comfort and style.",
    cta: "View Accommodations",
    link: "#services",
    image: hutImg,
  },
  {
    title: "Elegant Dining",
    subtitle: "A Table for Every Occasion",
    description: "Whether it's a romantic dinner or a family gathering, we have the perfect spot for you.",
    cta: "Reserve a Table",
    link: "/restaurant",
    image: diningTableImg,
  },
  {
    title: "Bright Days by the Water",
    subtitle: "Sun-Soaked Fun",
    description: "Our pool area is the perfect place to enjoy the sun and have a great time with friends.",
    cta: "Join Us",
    link: "/pool",
    image: poolDayImg,
  },
  {
    title: "Modern Tradition",
    subtitle: "Stylishly Authentic",
    description: "Blending modern architecture with traditional elements for a unique aesthetic experience.",
    cta: "Take a Tour",
    link: "#services",
    image: hut1Img,
  },
  {
    title: "Pure Tranquility",
    subtitle: "Water's Gentle Rhythm",
    description: "Let the soothing sound of our fountains wash away the stress of the day.",
    cta: "Find Peace",
    link: "#services",
    image: fountain2Img,
  },
  {
    title: "Splashes of Joy",
    subtitle: "Endless Poolside Fun",
    description: "Make a splash and create unforgettable memories in our state-of-the-art swimming pools.",
    cta: "Dive In",
    link: "/pool",
    image: pool2Img,
  },
  {
    title: "Enchanting Nights",
    subtitle: "Magic Under the Stars",
    description: "Our space transforms at night into a magical setting for evening relaxation.",
    cta: "Evening Events",
    link: "/events",
    image: nightPoolImg,
  },
  {
    title: "Stay Informed",
    subtitle: "Your Community Notice Board",
    description: "Keep up to date with the latest announcements and upcoming community activities.",
    cta: "View Board",
    link: "#services",
    image: boardImg,
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Slightly faster for more images
    return () => clearInterval(timer);
  }, []);

  const slide = heroSlides[currentSlide];

  return (
    <section className="relative min-h-[70vh] md:min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image with Transition */}
      <div className="absolute inset-0">
        {heroSlides.map((s, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
          >
            <img
              src={s.image}
              alt={s.title}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl">
          <div
            key={currentSlide}
            className="animate-fade-in"
          >
            <span className="inline-block px-4 py-1.5 md:py-2 bg-accent/20 backdrop-blur-sm rounded-full text-accent font-medium text-[10px] md:text-sm mb-4 md:mb-6 uppercase tracking-wider">
              {slide.subtitle}
            </span>
            <h1 className="font-display text-3xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight drop-shadow-md">
              {slide.title}
            </h1>
            <p className="text-sm md:text-xl text-primary-foreground/90 mb-6 md:mb-8 max-w-xl leading-relaxed md:leading-relaxed">
              {slide.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
              <Link to={slide.link} className="w-full sm:w-auto">
                <Button variant="hero" size="xl" className="w-full sm:w-auto h-11 md:h-14">
                  {slide.cta}
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button variant="heroOutline" size="xl" className="w-full sm:w-auto h-11 md:h-14">
                  Join Community
                </Button>
              </Link>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="flex flex-wrap gap-2 md:gap-3 mt-8 md:mt-12">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${index === currentSlide
                  ? "w-8 md:w-12 bg-accent"
                  : "w-1.5 md:w-2 bg-primary-foreground/40 hover:bg-primary-foreground/60"
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
