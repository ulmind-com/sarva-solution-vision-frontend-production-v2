import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getGalleryImages } from '@/services/siteSettingService';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface GalleryItem {
  position: number;
  title: string;
  imageUrl: string;
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const GallerySection = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response: any = await getGalleryImages();
        if (response?.success && response?.data) {
          // Sort by position to ensure strict 1-12 ordering
          const sorted = [...response.data].sort((a, b) => a.position - b.position);
          setImages(sorted);
        }
      } catch (error) {
        console.error('Failed to fetch gallery images', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  if (isLoading) {
    return (
      <section className="py-20 md:py-28 bg-muted/20">
        <div className="container mx-auto px-6 text-center">
          <div className="h-8 w-64 bg-muted animate-pulse mx-auto mb-4 rounded" />
          <div className="h-4 w-96 bg-muted animate-pulse mx-auto mb-16 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-[4/3] bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (images.length === 0) {
    return null; // Don't show the section if no images are present
  }

  return (
    <section id="gallery" className="py-20 md:py-28 bg-muted/20">
      <div className="container mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our <span className="text-primary">Gallery</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A glimpse into our world of achievements, events, and success stories.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {images.map((img) => (
            <motion.div
              key={img.position}
              variants={fadeInUp}
              onClick={() => setSelectedImage(img)}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg cursor-pointer max-w-full mx-auto w-full"
            >
              {/* Main Image */}
              <img
                src={img.imageUrl}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
              />

              {/* Hover Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

              {/* Hover Title Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                <h3 className="text-white text-xl md:text-2xl font-bold opacity-0 group-hover:opacity-100 transition-opacity delay-200">
                  {img.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Lightbox / Fullscreen Image */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="sm:max-w-4xl p-0 border-none bg-transparent shadow-none [&>button]:hidden">
          <DialogTitle className="sr-only">
            {selectedImage?.title || 'Gallery Image'}
          </DialogTitle>
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {selectedImage && (
              <>
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.title} 
                  className="w-full h-auto max-h-[85vh] object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 bg-white/5 backdrop-blur-sm"
                />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full shadow-lg">
                  <p className="text-white font-medium">{selectedImage.title}</p>
                </div>
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-4 -right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-110 ring-4 ring-white transition-all duration-300"
                >
                  <X className="h-5 w-5 font-bold" />
                  <span className="sr-only">Close</span>
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
