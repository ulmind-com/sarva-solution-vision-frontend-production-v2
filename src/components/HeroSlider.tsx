import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const sliderData = [
  {
    id: 1,
    image: '/heroimages/aquaculture.png',
    title: 'Advanced',
    highlight: 'Aquaculture',
    subtitle: 'Dive into sustainable fish farming solutions and high-quality aquatic feed for maximum yield.',
  },
  {
    id: 2,
    image: '/heroimages/agriculture.png',
    title: 'Modern',
    highlight: 'Agriculture',
    subtitle: 'Cultivating the future with 100% organic farming solutions, protecting both the soil and the yield.',
  },
  {
    id: 3,
    image: '/heroimages/healthcare.png',
    title: 'Holistic',
    highlight: 'Health Care',
    subtitle: 'Revitalize your body and mind with our heritage-inspired Ayurvedic and organic healthcare range.',
  },
  {
    id: 4,
    image: '/heroimages/personalcare.png',
    title: 'Natural',
    highlight: 'Personal Care',
    subtitle: 'Nourish your skin and hair with our chemical-free, nutrient-rich personal care formulations.',
  },
  {
    id: 5,
    image: '/heroimages/HomeCare.png',
    title: 'Safe & Clean',
    highlight: 'Home Care',
    subtitle: 'Eco-friendly cleaning solutions to keep your home pure, hygienic, and perfectly safe for your family.',
  },
  {
    id: 6,
    image: '/heroimages/luxuaryGoods.png',
    title: 'Premium',
    highlight: 'Luxury Goods',
    subtitle: 'Experience elegance with our sustainably crafted, exclusive luxury items designed for excellence.',
  },
];

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === sliderData.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? sliderData.length - 1 : prev - 1));
  };

  return (
    <section id="home" className="relative w-full overflow-hidden bg-black">
      <div className="relative w-full h-[60vh] sm:h-[70vh] md:h-[85vh] lg:h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            {/* Layer 1: Blurred background fill - fills edges so no black bars */}
            <div
              className="absolute inset-0 scale-125"
              style={{
                backgroundImage: `url(${sliderData[currentSlide].image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(40px) brightness(0.5)',
              }}
            />

            {/* Layer 2: Main image - full visible, no crop */}
            <motion.img
              src={sliderData[currentSlide].image}
              alt={sliderData[currentSlide].highlight}
              className="absolute inset-0 w-full h-full object-contain z-[1]"
              animate={{ scale: 1.02 }}
              initial={{ scale: 1 }}
              transition={{ duration: 10, ease: "linear" }}
              draggable={false}
            />

            {/* Layer 3: Gradient overlays for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent z-[2]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-[2]" />

            {/* Layer 4: Decorative accents */}
            <div className="absolute top-20 right-10 w-48 md:w-72 h-48 md:h-72 bg-green-500/10 rounded-full blur-3xl z-[3] mix-blend-screen" />
            <div className="absolute bottom-20 left-10 w-64 md:w-96 h-64 md:h-96 bg-amber-500/8 rounded-full blur-3xl z-[3] mix-blend-screen" />
          </motion.div>
        </AnimatePresence>

        {/* Content Overlay */}
        <div className="absolute inset-0 z-20 flex items-end sm:items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20 sm:pb-0">
            <div className="max-w-3xl mt-0 sm:mt-8 md:mt-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`content-${currentSlide}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-3 sm:mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
                    {sliderData[currentSlide].title}<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500">
                      {sliderData[currentSlide].highlight}.
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-200 mb-6 sm:mb-10 max-w-2xl font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] border-l-4 border-amber-400 pl-3 sm:pl-4">
                    {sliderData[currentSlide].subtitle}
                  </p>

                  <div className="flex flex-row gap-3 sm:gap-4">
                    <Link to="/user/products">
                      <Button size="lg" className="font-bold px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] transition-all duration-300 rounded-full">
                        Explore Products
                        <ArrowRight className="ml-1.5 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="font-bold px-4 sm:px-8 py-3 sm:py-6 text-sm sm:text-lg bg-white/10 backdrop-blur-md text-white border-white/20 hover:bg-white/20 hover:text-white rounded-full transition-all duration-300"
                      >
                        Join Our Vision
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-amber-500 hover:border-amber-500 hover:text-black transition-all group shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:-translate-x-0.5 transition-transform" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md border border-white/20 text-white hover:bg-amber-500 hover:border-amber-500 hover:text-black transition-all group shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:scale-105"
        >
          <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Progress Indicators */}
        <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 sm:gap-2">
          {sliderData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1 sm:h-1.5 transition-all duration-500 rounded-full ${
                currentSlide === index ? 'w-6 sm:w-8 bg-amber-400' : 'w-1.5 sm:w-2 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSlider;
