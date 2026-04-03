import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { uploadSiteBanner, getSiteBanner } from '@/services/siteSettingService';
import { Image as ImageIcon, Upload, Loader2, X, ImagePlus, Layout } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminGalleryManager from '@/components/admin/AdminGalleryManager';

const SiteSettings = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<string | null>(null);
  const [isLoadingBanner, setIsLoadingBanner] = useState(true);

  const fetchCurrentBanner = async () => {
    setIsLoadingBanner(true);
    try {
      const response: any = await getSiteBanner();
      if (response?.success && response?.data?.bannerUrl) {
        setCurrentBanner(response.data.bannerUrl);
      } else {
        setCurrentBanner(null);
      }
    } catch (error) {
      console.error('Failed to fetch current banner', error);
      setCurrentBanner(null);
    } finally {
      setIsLoadingBanner(false);
    }
  };

  useEffect(() => {
    fetchCurrentBanner();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an image to upload.');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      await uploadSiteBanner(formData);
      toast.success('Site banner uploaded successfully!');
      setFile(null);
      setPreview(null);
      fetchCurrentBanner(); // Refresh the current banner after successful upload
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload banner');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Site Settings</h1>
        <p className="text-muted-foreground">Manage global settings for the application</p>
      </div>

      <Tabs defaultValue="banner" className="space-y-6">
        <TabsList className="bg-muted/50 border border-border p-1 w-full sm:w-auto h-auto grid grid-cols-2 sm:flex sm:flex-row gap-1">
          <TabsTrigger value="banner" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5">
            <ImageIcon className="h-4 w-4 mr-2" />
            Home Banner
          </TabsTrigger>
          <TabsTrigger value="gallery" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-2.5">
            <Layout className="h-4 w-4 mr-2" />
            Image Gallery
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banner" className="m-0">
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Home Page Banner / Popup
            </CardTitle>
            <CardDescription>
              Upload an image to display as a popup banner on the home page. Uploading a new banner will automatically replace the old one.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Current Banner Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4" /> Currently Active Banner
              </h3>
              
              <div className="rounded-xl border-2 border-dashed border-border p-2 bg-muted/30">
                {isLoadingBanner ? (
                  <Skeleton className="w-full h-[200px] rounded-lg" />
                ) : currentBanner ? (
                  <div className="relative rounded-lg overflow-hidden group">
                    <img 
                      src={currentBanner} 
                      alt="Current Active Banner" 
                      className="w-full max-h-[300px] object-contain bg-background"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                      <span className="text-white font-medium bg-black/50 px-3 py-1 rounded-full text-sm">
                        Live on Home Page
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mb-3 opacity-20" />
                    <p>No active banner currently set.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-border" />

            {/* Upload New Banner Section */}
            <div className="space-y-6">
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImagePlus className="h-4 w-4" /> Upload New Banner
              </h3>
              <div className="flex flex-col gap-4">
                <Label htmlFor="banner-upload">Select Image from computer</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="banner-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="max-w-sm"
                  disabled={isUploading}
                />
                {(file || preview) && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {preview && (
              <div className="rounded-lg border overflow-hidden mt-4 max-w-2xl bg-muted relative">
                <img src={preview} alt="Banner Preview" className="w-full h-auto max-h-[400px] object-contain" />
              </div>
            )}

            <Button 
              onClick={handleUpload} 
              disabled={!file || isUploading}
              className="mt-4"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Banner
                </>
              )}
              </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="m-0">
          <AdminGalleryManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteSettings;
