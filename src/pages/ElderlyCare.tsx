import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Heart, Activity, BookOpen, Utensils, Calendar, Music, Palette,
  Gamepad2, GraduationCap, Apple, Phone, Check, MapPin, Users
} from "lucide-react";
import elderlyHeroImg from "@/assets/elderly-hero.webp";
import elderlyCare1Img from "@/assets/elderly-care1.webp";
import elderlyCare2Img from "@/assets/elderly-care2.webp";
import elderlyCare3Img from "@/assets/elderly-care3.webp";
import ayaElderlyCareImg from "@/assets/Aya-elderly-care.webp";

const dayCareActivities = [
  { icon: Activity, name: "Gentle Stretching Exercises", description: "Low-impact exercises to keep the body active and flexible" },
  { icon: BookOpen, name: "Story Telling", description: "Sharing stories and memories from the past" },
  { icon: Utensils, name: "Cooking", description: "Cooking activities and meal preparation" },
  { icon: Calendar, name: "Holiday and Birthday Celebrations", description: "Celebrating special occasions together" },
  { icon: MapPin, name: "Local Outings", description: "Community visits and local excursions" },
  { icon: Palette, name: "Arts and Crafts", description: "Creative activities and art projects" },
  { icon: Music, name: "Musical Entertainment and Sing-a-longs", description: "Music sessions and group singing" },
  { icon: Gamepad2, name: "Mental Stimulation Games", description: "Drafts, ludo, oware and other games" },
];

const trainingTopics = [
  { icon: GraduationCap, title: "Aging Well", description: "Learning to age gracefully with dignity and purpose" },
  { icon: Activity, title: "Importance of Exercise and Fitness", description: "Understanding the benefits of staying active" },
  { icon: Users, title: "Grand Parenting", description: "Building stronger relationships with grandchildren" },
  { icon: Apple, title: "Healthy Eating", description: "Nutritional guidance for better health" },
  { icon: Heart, title: "Family Health", description: "Maintaining family wellness and connections" },
];

export default function ElderlyCare() {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img
          src={elderlyHeroImg}
          alt="AYA Elderly Care Centre"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/50 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-primary-foreground">
            <span className="inline-block px-4 py-2 bg-green-500/20 backdrop-blur-sm rounded-full text-green-400 font-medium text-sm mb-4">
              All Services FREE of Charge
            </span>
            <h1 className="font-display text-3xl md:text-6xl font-bold mb-4">Where Compassion Lives</h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 max-w-xl mx-auto">
              A Safe Haven for the Elderly - Enriching Every Stage of Life
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* About Us Button */}
        <div className="text-center mb-12">
          <Link to="/about-us">
            <Button size="lg" className="gap-2">
              About Us
            </Button>
          </Link>
        </div>

        {/* Day Care Activities */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">The Elderly Care Centre</h2>
            <p className="section-subtitle mx-auto">
              Daily activities designed to engage, entertain, and enrich the lives of our elderly community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {dayCareActivities.map((activity, i) => {
              const Icon = activity.icon;
              return (
                <Card
                  key={activity.name}
                  className="text-center hover:shadow-medium transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-7 h-7 text-accent" />
                    </div>
                    <h3 className="font-display font-semibold mb-2">{activity.name}</h3>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Image Gallery */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">Our Care Centre</h2>
            <p className="section-subtitle mx-auto">
              A welcoming space where the elderly find comfort, companionship, and care
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="overflow-hidden hover:shadow-medium transition-all">
              <div className="h-64 overflow-hidden">
                <img
                  src={ayaElderlyCareImg}
                  alt="AYA Elderly Care Centre"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-medium transition-all">
              <div className="h-64 overflow-hidden">
                <img
                  src={elderlyCare1Img}
                  alt="Elderly Care Activities"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-medium transition-all">
              <div className="h-64 overflow-hidden">
                <img
                  src={elderlyCare2Img}
                  alt="Elderly Care Services"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            </Card>
            <Card className="overflow-hidden hover:shadow-medium transition-all">
              <div className="h-64 overflow-hidden">
                <img
                  src={elderlyCare3Img}
                  alt="Elderly Care Community"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                />
              </div>
            </Card>
          </div>
        </section>

        {/* Training Areas */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="section-title mb-4">Elderly Training Areas</h2>
            <p className="section-subtitle mx-auto">
              Training sessions organized on various topics to assist the elderly age gracefully
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trainingTopics.map((topic, i) => {
              const Icon = topic.icon;
              return (
                <Card
                  key={topic.title}
                  className="hover:shadow-medium transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-lg mb-2">{topic.title}</h3>
                        <p className="text-sm text-muted-foreground">{topic.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Key Features */}
        <Card className="bg-primary text-primary-foreground mb-16">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h3 className="font-display text-2xl font-bold mb-2">Our Commitment</h3>
              <p className="text-primary-foreground/80">
                A safe and secure place for the elderly, reducing the burden on families
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                "Completely Free of Charge",
                "Safe & Secure Environment",
                "Quality Day Care Services",
              ].map((feature, i) => (
                <div key={i} className="flex items-center justify-center gap-3">
                  <Check className="w-5 h-5 text-green-400 shrink-0" />
                  <span className="text-lg">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>


      </div>
    </Layout>
  );
}
