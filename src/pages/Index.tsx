import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { UpcomingEvents } from "@/components/home/UpcomingEvents";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ServicesSection />
      <UpcomingEvents />
      <CTASection />
    </Layout>
  );
};

export default Index;
