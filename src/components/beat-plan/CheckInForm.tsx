import { useState, useRef, useEffect } from 'react';
import { GPSCoordinates } from '@/types/beatPlan';
import { X, Camera, Upload, MapPin, Loader2 } from 'lucide-react';

interface CheckInFormProps {
  onSubmit: (photoUrl: string, location?: GPSCoordinates, notes?: string) => void;
  onClose: () => void;
}

export function CheckInForm({ onSubmit, onClose }: CheckInFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState<GPSCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get GPS location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    setIsGettingLocation(true);
    setLocationError('');
    
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Location permission denied');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Location unavailable');
            break;
          case error.TIMEOUT:
            setLocationError('Location request timed out');
            break;
          default:
            setLocationError('Unable to get location');
        }
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (photoUrl) {
      onSubmit(photoUrl, location || undefined, notes || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-md max-h-[90vh] rounded-t-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="touch-feedback">
            <X size={24} />
          </button>
          <h2 className="font-semibold">Check In</h2>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Location Status */}
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            location ? 'bg-success/10 border-2 border-success' : 
            locationError ? 'bg-destructive/10 border-2 border-destructive' :
            'bg-muted border-2 border-border'
          }`}>
            {isGettingLocation ? (
              <>
                <Loader2 size={20} className="animate-spin text-muted-foreground" />
                <span className="text-sm">Getting your location...</span>
              </>
            ) : location ? (
              <>
                <MapPin size={20} className="text-success" />
                <div>
                  <p className="text-sm font-medium text-success">Location captured</p>
                  <p className="text-xs text-muted-foreground">
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <MapPin size={20} className="text-destructive" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-destructive">{locationError}</p>
                  <button 
                    onClick={getLocation}
                    className="text-xs text-primary underline"
                  >
                    Try again
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Photo Upload */}
          <div className="space-y-2">
            <label className="font-medium">Photo Proof *</label>
            
            {photoUrl ? (
              <div className="relative">
                <img 
                  src={photoUrl} 
                  alt="Check-in proof" 
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => setPhotoUrl('')}
                  className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg touch-feedback"
                >
                  <Camera size={32} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Take Photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-lg touch-feedback"
                >
                  <Upload size={32} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Upload</span>
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="font-medium">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this visit..."
              className="w-full p-3 border-2 border-border rounded-lg resize-none h-20 bg-card"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!photoUrl}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Check In
          </button>
        </div>
      </div>
    </div>
  );
}
