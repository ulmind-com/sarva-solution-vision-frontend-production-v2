import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import WhatsAppWidget from '@/components/WhatsAppWidget';
import { ThemeToggle } from '@/components/ThemeToggle';
import BannerPopup from '@/components/BannerPopup';
import GallerySection from '@/components/GallerySection';
import {
  Sprout,
  Fish,
  Smile,
  HeartPulse,
  Home,
  Gem,
  ArrowRight,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  BookOpen,
  Award,
  Truck,
  Headphones,
  TrendingUp,
  Users,
  Clock,
  Globe,
  Leaf,
  MapPin,
  Building2
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const productSegments = [
  { name: 'Agriculture', icon: Sprout, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
  { name: 'Aquaculture', icon: Fish, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  { name: 'Personal Care', icon: Smile, color: 'text-pink-600', bg: 'bg-pink-100 dark:bg-pink-900/30' },
  { name: 'Health Care', icon: HeartPulse, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
  { name: 'Home Care', icon: Home, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  { name: 'Luxury Goods', icon: Gem, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
];

const whyChooseUs = [
  { title: 'Ancient Wisdom', description: 'Supplements based on Historical Indian Vedas.', icon: BookOpen },
  { title: 'Quality Assured', description: 'Premium organic & wellness products.', icon: Award },
  { title: 'Timely Delivery', description: 'Industry-best packaging & safety.', icon: Truck },
  { title: 'Support System', description: 'Dedicated customer care team.', icon: Headphones },
  { title: 'Rewarding Plan', description: 'Designed for maximum income & stability.', icon: TrendingUp },
  { title: 'Trusted Network', description: 'Build a secure, independent career.', icon: Users },
  { title: 'Transparent Payouts', description: 'Hard work rewarded on time.', icon: Clock },
  { title: 'Global Vision', description: 'Promoting Indian organic excellence worldwide.', icon: Globe },
  { title: 'Eco-Friendly', description: 'Sustainable production protecting the planet.', icon: Leaf },
];

const LandingPage = () => {
  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar - Glassmorphism */}
      <nav className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img
              src="https://res.cloudinary.com/dkgwi1xvx/image/upload/v1769630007/sdfsdf_q4ziyu.png"
              alt="Sarva Solution Vision Logo"
              className="h-12 w-auto"
            />
            <span className="text-xl font-bold text-foreground hidden sm:block">Sarva Solution Vision</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-muted-foreground hover:text-foreground transition-colors">Home</button>
            <button onClick={() => scrollToSection('about-future')} className="text-muted-foreground hover:text-foreground transition-colors">About</button>
            <button onClick={() => scrollToSection('segments')} className="text-muted-foreground hover:text-foreground transition-colors">Segments</button>
            <button onClick={() => scrollToSection('banking')} className="text-muted-foreground hover:text-foreground transition-colors">Bank Details</button>
            <button onClick={() => scrollToSection('contact')} className="text-muted-foreground hover:text-foreground transition-colors">Contact</button>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button className="font-semibold">
                Member Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/90 via-green-800/80 to-emerald-700/70" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920)' }}
        />
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
              Cultivating Health,{' '}
              <span className="text-amber-300">Empowering People.</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
              Building a sustainable future where organic living, Ayurvedic wellness, and modern entrepreneurship come together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="font-semibold px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-black">
                Explore Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="font-semibold px-8 py-6 text-lg bg-background/90 text-foreground border border-border hover:bg-background"
                >
                  Join Our Vision
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Our Future Section */}
      <section id="about-future" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            className="grid md:grid-cols-2 gap-12 items-center"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp}>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                About Our Future
              </h2>
              <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                Sarva Solution Vision Private Limited is a vision-driven direct selling company committed to building a sustainable, transparent, and growth-oriented business ecosystem. Under the leadership of our directors—<strong className="text-foreground">Mr. Anis Rahaman Mallick</strong>, <strong className="text-foreground">Mr. Santosh Shahu</strong>, and <strong className="text-foreground">Mr. Md Rabiul Islam</strong>—we are founded on strong values and strategic thinking.
              </p>
              <p className="text-muted-foreground text-lg leading-relaxed">
                We proudly promote organic farming solutions, Ayurveda-based healthcare, and a philosophy of purity. Our mission is to deliver products that nurture health while creating ethical income opportunities for all.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="relative">
              <div className="bg-gradient-to-br from-green-100 to-amber-50 rounded-2xl p-4 shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800"
                  alt="Nature and Agriculture"
                  className="rounded-xl w-full h-80 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground rounded-xl p-4 shadow-lg">
                <p className="text-2xl font-bold">100%</p>
                <p className="text-sm">Organic Products</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Product Segments Section */}
      <section id="segments" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Product Segments
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our diverse range of premium products designed for holistic well-being.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {productSegments.map((segment) => (
              <motion.div
                key={segment.name}
                variants={fadeInUp}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group cursor-pointer"
              >
                <Card className="border-border hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${segment.bg} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                      <segment.icon className={`h-8 w-8 ${segment.color}`} />
                    </div>
                    <h3 className="font-semibold text-foreground">{segment.name}</h3>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* About Us - Vision/Mission Section */}
      <section className="py-20 md:py-28 bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950/20 dark:to-amber-950/20">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-8">
              Revolutionizing Life & Livelihood
            </h2>
            <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
              At Sarva Solution Vision Pvt. Ltd., our mission is to blend nature's purity with human potential. We believe that true success lies in holistic growth—where health, wealth, and happiness coexist.
            </p>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Our vision is to build a world connected through purpose, prosperity, and purity. We aspire to become a beacon of organic living and collective success, turning every dream into a sustainable reality.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Sarva Solution Vision?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Join a network that values integrity, growth, and sustainability.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {whyChooseUs.map((item) => (
              <motion.div key={item.title} variants={fadeInUp}>
                <Card className="border-border hover:shadow-lg transition-all duration-300 h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <item.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Gallery Section */}
      <GallerySection />

      {/* Banking Details Section */}
      <section id="banking" className="py-20 md:py-28 bg-muted/30">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="border-2 border-primary/20 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-green-600 p-6">
                <h2 className="text-2xl font-bold text-white text-center">
                  Official Banking Partner
                </h2>
              </div>
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">AXIS</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Bank Name</span>
                    <span className="font-semibold text-foreground">Axis Bank</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Account Name</span>
                    <span className="font-semibold text-foreground text-right text-sm md:text-base">SARVA SOLUTION VISION PRIVATE LIMITED</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">Account No.</span>
                    <span className="font-semibold text-foreground font-mono">925020052040283</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-border">
                    <span className="text-muted-foreground">IFSC Code</span>
                    <span className="font-semibold text-foreground font-mono">UTIB0003598</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-muted-foreground">Branch</span>
                    <span className="font-semibold text-foreground text-right">Chinar Park, Kolkata - 700136</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 via-green-700 to-emerald-700">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Life?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
              Join the fastest growing organic network today and be part of a sustainable future.
            </p>
            <Link to="/login">
              <Button size="lg" className="font-semibold px-8 py-6 text-lg bg-amber-500 hover:bg-amber-600 text-black">
                Register Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-900">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Contact Us
            </h2>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              Reach out to us at any of our offices or get in touch directly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 md:divide-x divide-slate-700">
            {/* Head Office */}
            <motion.div
              className="text-center md:text-left md:pr-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Head Office</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Tarafdar Bhavan – 1st Floor, Atghora,<br />
                Phool Tala, (Near Chinar Park),<br />
                Rajarhat Road, Kolkata-700136.
              </p>
            </motion.div>

            {/* Corporate Office */}
            <motion.div
              className="text-center md:text-left md:px-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Corporate Office</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                P C Mitra Lane, Parapukur,<br />
                (Near Tinkonia Bus Stand),<br />
                Purba Bardhaman – 713101.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              className="text-center md:text-left md:pl-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                  <Headphones className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Get In Touch</h3>
              </div>
              <div className="space-y-2 text-slate-300">
                <p>
                  <a href="mailto:sarvasolution25@gmail.com" className="hover:text-teal-400 transition-colors">
                    sarvasolution25@gmail.com
                  </a>
                </p>
                <p>www.sarvasolutionvision.com</p>
                <div className="pt-2">
                  <p><a href="tel:+919832775700" className="hover:text-teal-400 transition-colors">+91 98327 75700</a></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-8">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 items-center mb-8">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <img
                src="https://res.cloudinary.com/dkgwi1xvx/image/upload/v1769630007/sdfsdf_q4ziyu.png"
                alt="Sarva Solution Vision Logo"
                className="h-12 w-auto"
              />
              <span className="text-white font-semibold hidden sm:block">Sarva Solution Vision</span>
            </div>

            <div className="flex justify-center gap-4">
              <a href="https://www.facebook.com/share/187rjGnTre/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Facebook className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Twitter className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Instagram className="h-5 w-5 text-white" />
              </a>
              <a href="#" className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-teal-600 transition-colors">
                <Linkedin className="h-5 w-5 text-white" />
              </a>
            </div>

            <div className="flex justify-center md:justify-end gap-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors text-sm">Terms of Service</a>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-2">
            <p className="text-slate-400 text-sm">
              © 2026 Sarva Solution Vision Pvt. Ltd. All rights reserved.
            </p>
            <p className="text-slate-400 text-sm">
              Developed by <a href="https://www.ulmind.com" target="_blank" rel="noopener noreferrer" className="font-medium text-emerald-500 hover:text-emerald-400 hover:underline">ULMiND</a>
            </p>
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Widget */}
      <WhatsAppWidget />

      {/* Dynamic Banner Popup */}
      <BannerPopup />
    </div>
  );
};

export default LandingPage;
