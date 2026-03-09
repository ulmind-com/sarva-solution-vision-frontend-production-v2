import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle, Clock, XCircle, FileImage, X, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadState {
  file: File | null;
  preview: string | null;
}

const KYCDetailsTab = () => {
  const { user, isLoading, isProfileLoading, submitKYC, clearError } = useAuthStore();

  // Form state
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');

  // File states
  const [aadhaarFront, setAadhaarFront] = useState<FileUploadState>({ file: null, preview: null });
  const [aadhaarBack, setAadhaarBack] = useState<FileUploadState>({ file: null, preview: null });
  const [panImage, setPanImage] = useState<FileUploadState>({ file: null, preview: null });

  // Refs for file inputs
  const aadhaarFrontRef = useRef<HTMLInputElement>(null);
  const aadhaarBackRef = useRef<HTMLInputElement>(null);
  const panImageRef = useRef<HTMLInputElement>(null);

  // Get KYC status
  const kycStatus = user?.kyc?.status || 'none';
  const isLocked = kycStatus === 'pending' || kycStatus === 'approved';

  // Populate form with existing data when user data loads
  useEffect(() => {
    if (user) {
      // Format Aadhaar with spaces for display
      if (user.kyc?.aadhaarNumber) {
        const formatted = user.kyc.aadhaarNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
        setAadhaarNumber(formatted);
      }
      // Prioritize root panCardNumber, fallback to kyc.panCardNumber
      const pan = user.panCardNumber || user.kyc?.panCardNumber;
      if (pan) {
        setPanNumber(pan.toUpperCase());
      }
    }
  }, [user]);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<FileUploadState>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be less than 2MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      setter({
        file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const clearFile = (setter: React.Dispatch<React.SetStateAction<FileUploadState>>) => {
    setter({ file: null, preview: null });
  };

  const handleSubmit = async () => {
    // Validation
    if (!aadhaarNumber.trim()) {
      toast.error('Please enter Aadhaar Number');
      return;
    }

    if (!/^\d{12}$/.test(aadhaarNumber.replace(/\s/g, ''))) {
      toast.error('Aadhaar Number must be 12 digits');
      return;
    }

    if (!panNumber.trim()) {
      toast.error('Please enter PAN Number');
      return;
    }

    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      toast.error('Invalid PAN Number format');
      return;
    }

    if (!aadhaarFront.file) {
      toast.error('Please upload Aadhaar Front image');
      return;
    }

    if (!aadhaarBack.file) {
      toast.error('Please upload Aadhaar Back image');
      return;
    }

    if (!panImage.file) {
      toast.error('Please upload PAN Card image');
      return;
    }

    const formData = new FormData();
    formData.append('aadhaarNumber', aadhaarNumber.replace(/\s/g, ''));
    formData.append('panCardNumber', panNumber.toUpperCase());
    formData.append('aadhaarFront', aadhaarFront.file);
    formData.append('aadhaarBack', aadhaarBack.file);
    formData.append('panImage', panImage.file);
    formData.append('bankDetails', '{}');

    try {
      await submitKYC(formData);
      toast.success('KYC Submitted Successfully! Verification Pending.');
      // Clear form
      setAadhaarNumber('');
      setPanNumber('');
      setAadhaarFront({ file: null, preview: null });
      setAadhaarBack({ file: null, preview: null });
      setPanImage({ file: null, preview: null });
    } catch (error: any) {
      if (error.message.includes('pending')) {
        toast.error('Your KYC is already under review.');
      } else {
        toast.error(error.message || 'Upload Failed. Please try again.');
      }
      clearError();
    }
  };

  // Status Banner Component
  const renderStatusBanner = () => {
    if (kycStatus === 'pending') {
      return (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertTitle className="text-yellow-600">Verification in Progress</AlertTitle>
          <AlertDescription className="text-yellow-600/80">
            Your KYC documents are being verified. This usually takes 24-48 hours.
          </AlertDescription>
        </Alert>
      );
    }

    if (kycStatus === 'approved') {
      return (
        <Alert className="border-green-500/50 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">KYC Verified</AlertTitle>
          <AlertDescription className="text-green-600/80">
            Your KYC documents have been verified successfully.
          </AlertDescription>
        </Alert>
      );
    }

    if (kycStatus === 'rejected') {
      return (
        <Alert className="border-destructive/50 bg-destructive/10">
          <XCircle className="h-4 w-4 text-destructive" />
          <AlertTitle className="text-destructive">KYC Rejected</AlertTitle>
          <AlertDescription className="text-destructive/80">
            {user?.kyc?.rejectionReason || 'Your KYC was rejected. Please resubmit with correct documents.'}
          </AlertDescription>
        </Alert>
      );
    }

    return null;
  };

  // File Upload Component
  const FileUploadZone = ({
    label,
    fileState,
    onFileSelect,
    onClear,
    inputRef,
    existingUrl,
    disabled,
  }: {
    label: string;
    fileState: FileUploadState;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClear: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
    existingUrl?: string;
    disabled: boolean;
  }) => {
    const hasPreview = fileState.preview || existingUrl;

    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {disabled && existingUrl ? (
          // Show uploaded document in locked state
          <div className="border border-border rounded-lg p-4 bg-muted/50">
            <div className="flex items-center gap-3">
              <FileImage className="h-8 w-8 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Document Uploaded</p>
                <Badge variant="secondary" className="mt-1">Submitted</Badge>
              </div>
            </div>
          </div>
        ) : hasPreview ? (
          // Show preview with option to remove
          <div className="relative border border-border rounded-lg overflow-hidden">
            <img
              src={fileState.preview || existingUrl}
              alt={label}
              className="w-full h-40 object-contain bg-muted/50"
            />
            {!disabled && (
              <button
                onClick={onClear}
                className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          // Upload zone
          <div
            onClick={() => !disabled && inputRef.current?.click()}
            className={cn(
              "border-2 border-dashed border-border rounded-lg p-6 text-center transition-colors",
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:border-primary/50 cursor-pointer"
            )}
          >
            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Click to upload or drag & drop</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={onFileSelect}
          disabled={disabled}
        />
      </div>
    );
  };

  if (isProfileLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      {renderStatusBanner()}

      {/* KYC Status Badge */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Current Status:</span>
        <Badge
          variant={
            kycStatus === 'approved'
              ? 'default'
              : kycStatus === 'pending'
                ? 'secondary'
                : kycStatus === 'rejected'
                  ? 'destructive'
                  : 'outline'
          }
          className={cn(
            kycStatus === 'approved' && 'bg-green-600 hover:bg-green-600',
            kycStatus === 'pending' && 'bg-yellow-600 hover:bg-yellow-600 text-yellow-foreground'
          )}
        >
          {kycStatus === 'none' ? 'Not Submitted' : kycStatus.charAt(0).toUpperCase() + kycStatus.slice(1)}
        </Badge>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
          <div className="relative">
            <Input
              id="aadhaarNumber"
              type="text"
              placeholder="XXXX XXXX XXXX"
              maxLength={14}
              value={aadhaarNumber}
              onChange={(e) => {
                // Format as XXXX XXXX XXXX
                const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                setAadhaarNumber(formatted);
              }}
              disabled={isLocked}
              readOnly={isLocked}
              className={cn(
                'text-foreground placeholder:text-muted-foreground font-mono',
                isLocked && 'bg-muted/50 text-foreground pr-10'
              )}
            />
            {isLocked && kycStatus === 'approved' && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            )}
            {isLocked && kycStatus === 'pending' && (
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="panNumber">PAN Card Number</Label>
          <div className="relative">
            <Input
              id="panNumber"
              type="text"
              placeholder="XXXXX0000X"
              maxLength={10}
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              disabled={isLocked}
              readOnly={isLocked}
              className={cn(
                'text-foreground placeholder:text-muted-foreground font-mono uppercase',
                isLocked && 'bg-muted/50 text-foreground pr-10'
              )}
            />
            {isLocked && kycStatus === 'approved' && (
              <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
            )}
            {isLocked && kycStatus === 'pending' && (
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
      </div>

      {/* File Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadZone
          label="Bank PassBook 1st Page"
          fileState={aadhaarFront}
          onFileSelect={(e) => handleFileSelect(e, setAadhaarFront)}
          onClear={() => clearFile(setAadhaarFront)}
          inputRef={aadhaarFrontRef}
          existingUrl={kycStatus === 'rejected' ? undefined : user?.kyc?.aadhaarFront?.url}
          disabled={isLocked}
        />
        <FileUploadZone
          label="Aadhaar Card (Back)"
          fileState={aadhaarBack}
          onFileSelect={(e) => handleFileSelect(e, setAadhaarBack)}
          onClear={() => clearFile(setAadhaarBack)}
          inputRef={aadhaarBackRef}
          existingUrl={kycStatus === 'rejected' ? undefined : user?.kyc?.aadhaarBack?.url}
          disabled={isLocked}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FileUploadZone
          label="PAN Card"
          fileState={panImage}
          onFileSelect={(e) => handleFileSelect(e, setPanImage)}
          onClear={() => clearFile(setPanImage)}
          inputRef={panImageRef}
          existingUrl={kycStatus === 'rejected' ? undefined : user?.kyc?.panImage?.url}
          disabled={isLocked}
        />
      </div>

      {/* Submit Button */}
      {!isLocked && (
        <div className="pt-4">
          <Button onClick={handleSubmit} disabled={isLoading} className="w-full md:w-auto">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting KYC...
              </>
            ) : (
              'Submit KYC Documents'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default KYCDetailsTab;
