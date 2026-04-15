import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-hero-gradient relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 pattern-tribal opacity-30" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6">
            Ready to Experience Our Community?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of members who call AYA community center their second home.
            Start your journey today.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link to="/auth?mode=signup">
              <Button variant="hero" size="xl">
                Create Account
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/restaurant">
              <Button variant="heroOutline" size="xl">
                Order Food Now
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-primary-foreground/80">
            <a href="tel:+2348001234567" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Phone className="w-5 h-5" />
              <span>+233 24 123 4567</span>
            </a>
            <a href="mailto:info@communitycenter.ng" className="flex items-center gap-2 hover:text-accent transition-colors">
              <Mail className="w-5 h-5" />
              <span>info@communitycenter.gh</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
