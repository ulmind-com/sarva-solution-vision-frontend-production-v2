import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadGalleryImage, getGalleryImages } from '@/services/siteSettingService';
import { Upload, Loader2, ImagePlus, RefreshCw, GripHorizontal } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryItem {
  position: number;
  title: string;
  imageUrl: string;
}

const AdminGalleryManager = () => {
  const [galleryImages, setGalleryImages] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingPos, setUploadingPos] = useState<number | null>(null);

  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const response: any = await getGalleryImages();
      if (response?.success && response?.data) {
        setGalleryImages(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch gallery', error);
      toast.error('Failed to load gallery images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async (position: number, file: File, title: string) => {
    if (!file) return;
    if (!title.trim()) {
      toast.error('Title is required for gallery images');
      return;
    }

    setUploadingPos(position);
    const formData = new FormData();
    formData.append('position', position.toString());
    formData.append('title', title);
    formData.append('image', file);

    try {
      await uploadGalleryImage(formData);
      toast.success(`Gallery image at position ${position} updated!`);
      await fetchGallery();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingPos(null);
    }
  };

  // Create 12 slots
  const slots = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GripHorizontal className="h-5 w-5 text-primary" />
          Manage Home Page Gallery
        </CardTitle>
        <CardDescription>
          Upload up to 12 images to display in the gallery section on the home page. Images will be displayed in grid format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {slots.map((s) => (
              <Skeleton key={s} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {slots.map((pos) => {
              const currentImage = galleryImages.find((img) => img.position === pos);
              return (
                <GallerySlotManager 
                  key={pos} 
                  position={pos} 
                  currentImage={currentImage} 
                  onUpload={handleUpload}
                  isUploading={uploadingPos === pos}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const GallerySlotManager = ({ 
  position, 
  currentImage, 
  onUpload, 
  isUploading 
}: { 
  position: number; 
  currentImage?: GalleryItem; 
  onUpload: (position: number, file: File, title: string) => void;
  isUploading: boolean;
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState(currentImage?.title || '');

  // Reset state if currentImage updates externally
  useEffect(() => {
    setTitle(currentImage?.title || '');
    setFile(null);
    setPreview(null);
  }, [currentImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSave = () => {
    if (file) {
      onUpload(position, file, title);
    }
  };

  return (
    <div className="border border-border rounded-xl p-4 bg-muted/10 flex flex-col gap-4 relative overflow-hidden transition-all hover:border-primary/50">
      <div className="absolute top-2 right-2 bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded-md">
        Slot #{position}
      </div>
      
      {/* Image Preview Area */}
      <div className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-border/60 bg-muted/30 flex items-center justify-center overflow-hidden relative group">
        {preview ? (
           <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : currentImage ? (
           <img src={currentImage.imageUrl} alt={currentImage.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
           <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
             <ImagePlus className="h-8 w-8" />
             <span className="text-sm">Empty Slot</span>
           </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="space-y-1">
          <Label className="text-xs">Image Title</Label>
          <Input 
            placeholder="e.g. Annual Meeting" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        
        <div className="space-y-1">
          <Label className="text-xs">Upload New Image</Label>
          <Input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="h-8 text-sm file:mr-2 file:py-0 file:px-2 file:border-0 file:bg-primary/10 file:text-primary hover:file:bg-primary/20 text-xs"
          />
        </div>

        <Button 
          size="sm" 
          className="w-full mt-2" 
          disabled={!file || !title.trim() || isUploading}
          onClick={handleSave}
        >
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
          {currentImage ? 'Replace Image' : 'Upload Image'}
        </Button>
      </div>
    </div>
  );
};

export default AdminGalleryManager;
