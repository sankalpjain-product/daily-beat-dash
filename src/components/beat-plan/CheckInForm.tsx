import { useState, useRef } from 'react';
import { Camera, Upload, X, Check } from 'lucide-react';

interface CheckInFormProps {
  onSubmit: (photoUrl: string, notes?: string) => void;
  onClose: () => void;
}

export function CheckInForm({ onSubmit, onClose }: CheckInFormProps) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (photo) {
      onSubmit(photo, notes || undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-md rounded-t-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
          <button onClick={onClose} className="touch-feedback">
            <X size={24} />
          </button>
          <h2 className="font-semibold">Check In</h2>
          <button 
            onClick={handleSubmit} 
            className={`touch-feedback ${!photo ? 'opacity-50' : ''}`}
            disabled={!photo}
          >
            <Check size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Photo Area */}
          <div className="aspect-[4/3] bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {photo ? (
              <img src={photo} alt="Check-in photo" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-muted-foreground">
                <Camera size={48} className="mx-auto mb-2" />
                <p className="text-sm">Take a photo as proof</p>
              </div>
            )}
          </div>

          {/* Photo Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 btn-secondary flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              <span>Take Photo</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 btn-outline flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              <span>Upload</span>
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              className="mobile-input min-h-[80px] resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!photo}
            className={`w-full btn-primary py-3 ${!photo ? 'opacity-50' : ''}`}
          >
            Submit Check-in
          </button>
        </div>
      </div>
    </div>
  );
}
