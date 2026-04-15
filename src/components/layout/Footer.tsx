import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* About */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display text-xl font-bold">AYA</span>
              </div>
              <div>
                <span className="font-display text-xl font-bold">Community</span>
                <span className="font-display text-xl font-bold text-accent ml-1">Center</span>
              </div>
            </div>
            <p className="text-primary-foreground/80 leading-relaxed">
              Your home for dining, relaxation, celebrations, and entertainment.
              Serving our community with excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { name: "Restaurant", path: "/restaurant" },
                { name: "Swimming Pool", path: "/pool" },
                { name: "Event Space", path: "/events" },
                { name: "My Account", path: "/dashboard" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-primary-foreground/80 hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-primary-foreground/80">
                  AYA Community Center<br />Ampain, Ghana
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/80">+233 20 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-accent" />
                <span className="text-primary-foreground/80">info@ayacommunitycenter.gh</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-accent mt-0.5" />
                <span className="text-primary-foreground/80">
                  Mon - Sun: 6:00 AM - 11:00 PM
                </span>
              </li>
            </ul>
          </div>

          {/* Social & Newsletter */}
          <div>
            <h4 className="font-display text-lg font-semibold mb-6">Stay Connected</h4>
            <div className="flex gap-3 mb-6">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
            <p className="text-primary-foreground/80 text-sm">
              Follow us for updates on events, special offers, and community news.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p className="text-primary-foreground/60 text-sm">
              © 2025 AYA Community Center. All rights reserved.
            </p>
            <span className="hidden md:block text-primary-foreground/20">|</span>
            <p className="text-primary-foreground/60 text-sm">
              Developed by{" "}
              <a
                href="https://nurrideen-portfolio.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline font-medium transition-all"
              >
                Marshall Nurrideen
              </a>
            </p>
          </div>
          <div className="flex gap-6 text-sm">
            <Link to="/privacy" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary-foreground/60 hover:text-accent transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
