import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { getSiteBanner } from '@/services/siteSettingService';
import { X } from 'lucide-react';
// We hide DialogTitle using className="sr-only" for accessibility

const BannerPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchBanner = async () => {
      try {
        const response: any = await getSiteBanner();
        if (isMounted && response?.success && response?.data?.bannerUrl) {
          setBannerUrl(response.data.bannerUrl);
          // Optional: Check if user already closed it this session. For now, open every time on render.
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Failed to fetch banner:', error);
      }
    };

    fetchBanner();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!bannerUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-2xl p-0 border-none bg-transparent shadow-none [&>button]:hidden">
        {/* We add [&>button]:hidden to hide the default close button of DialogContent because we want a custom one that looks better for banners */}
        <DialogTitle className="sr-only">Site Announcement</DialogTitle>
        <div className="relative w-full h-full flex items-center justify-center">
          <img 
            src={bannerUrl} 
            alt="Site Announcement" 
            className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500 bg-white/5 backdrop-blur-sm"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute -top-4 -right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white shadow-xl hover:bg-red-700 hover:scale-110 ring-4 ring-white transition-all duration-300"
          >
            <X className="h-5 w-5 font-bold" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BannerPopup;
