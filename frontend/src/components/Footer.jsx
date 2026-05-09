import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border pt-16 pb-8 transition-colors duration-300">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
                <span className="text-slate-900 font-bold text-xl">T</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-700 bg-clip-text text-transparent">
                TerraSpotter
              </span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-xs">
              Mapping the right place to plant. Join our community-driven effort to restore our planet's green cover, one tree at a time.
            </p>
            <div className="flex items-center space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all duration-300">
                <Github size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all duration-300">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:bg-emerald-500 hover:text-white transition-all duration-300">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-foreground font-semibold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/browse" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                  <span>Explore Lands</span>
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                  <span>Community Feed</span>
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                  <span>Leaderboard</span>
                </Link>
              </li>
              <li>
                <Link to="/forum" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200 flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"></span>
                  <span>Discussions</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-foreground font-semibold text-lg mb-6">Support</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200">About Us</Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200">Contact Support</Link>
              </li>
              <li>
                <Link to="/faq" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200">FAQs</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-emerald-400 transition-colors duration-200">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-foreground font-semibold text-lg mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-muted-foreground">
                <MapPin className="text-emerald-500 mt-1 shrink-0" size={18} />
                <span>123 Green Avenue, Eco City, EC 56789</span>
              </li>
              <li className="flex items-center space-x-3 text-muted-foreground">
                <Phone className="text-emerald-500 shrink-0" size={18} />
                <span>+1 (555) 000-GREEN</span>
              </li>
              <li className="flex items-center space-x-3 text-muted-foreground">
                <Mail className="text-emerald-500 shrink-0" size={18} />
                <span>hello@terraspotter.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            © {currentYear} TerraSpotter. All rights reserved. Made with 💚 for the Planet.
          </p>
          <div className="flex items-center space-x-8 text-sm text-muted-foreground">
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="hover:text-slate-300 transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
