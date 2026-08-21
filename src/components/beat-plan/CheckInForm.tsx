import { useState, useRef, useEffect, useCallback } from 'react';
import { Agent, GPSCoordinates } from '@/types/beatPlan';
import { X, Camera, MapPin, Loader2, RefreshCw, Check, ShieldAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type LocationTrust = 'verified' | 'suspected_spoof' | 'unavailable';

/** Heuristics for detecting a faked / mock GPS provider on the device. */
function detectSpoof(position: GeolocationPosition): string | null {
  const c = position.coords;
  const anyPos = position as GeolocationPosition & { mocked?: boolean };

  if (anyPos.mocked === true) return 'Device reported a mock location provider.';
  if (c.accuracy === 0) return 'Reported accuracy of 0 m is not possible on real GPS hardware.';
  if (
    c.accuracy <= 5 &&
    c.altitude === null &&
    c.speed === null &&
    c.heading === null
  ) {
    return 'Pin-point accuracy with no altitude, speed or heading data — typical of a fake GPS app.';
  }
  if (
    Number.isInteger(c.latitude) && Number.isInteger(c.longitude)
  ) {
    return 'Coordinates are exact whole numbers, which indicates a manually set location.';
  }
  if (position.timestamp && Math.abs(Date.now() - position.timestamp) > 5 * 60 * 1000) {
    return 'Location timestamp is stale by more than 5 minutes.';
  }
  return null;
}

interface CheckInFormProps {
  agents: Agent[];
  onSubmit: (
    photoUrl: string,
    metAgentIds: string[],
    location?: GPSCoordinates,
    notes?: string,
    locationTrust?: LocationTrust,
    spoofReason?: string
  ) => void;
  onClose: () => void;
}

export function CheckInForm({ agents, onSubmit, onClose }: CheckInFormProps) {
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [metAgentIds, setMetAgentIds] = useState<string[]>([]);
  const [location, setLocation] = useState<GPSCoordinates | null>(null);
  const [locationError, setLocationError] = useState<string>('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [spoofReason, setSpoofReason] = useState<string>('');
  const [showSpoofDialog, setShowSpoofDialog] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setIsCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraReady(true);
    } catch {
      setCameraError('Camera access denied. Live photo is required to check in.');
    }
  }, []);

  const getLocation = useCallback(() => {
    setIsGettingLocation(true);
    setLocationError('');

    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const reason = detectSpoof(position);
        setSpoofReason(reason ?? '');
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  useEffect(() => {
    getLocation();
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhotoUrl(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  };

  const retakePhoto = () => {
    setPhotoUrl('');
    startCamera();
  };

  const toggleAgent = (id: string) => {
    setMetAgentIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const canSubmit = !!photoUrl && (agents.length === 0 || metAgentIds.length > 0);

  const submitCheckIn = () => {
    const trust: LocationTrust = !location
      ? 'unavailable'
      : spoofReason
      ? 'suspected_spoof'
      : 'verified';
    onSubmit(
      photoUrl,
      metAgentIds,
      location || undefined,
      notes || undefined,
      trust,
      spoofReason || undefined
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (location && spoofReason) {
      setShowSpoofDialog(true);
      return;
    }
    submitCheckIn();
  };

  return (
    <div className="fixed inset-0 bg-primary/50 z-50 flex items-end justify-center">
      <div className="bg-card w-full max-w-md max-h-[90vh] rounded-t-2xl overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <button onClick={onClose} className="touch-feedback" aria-label="Close check in">
            <X size={24} />
          </button>
          <h2 className="font-semibold">Check In</h2>
          <div className="w-6" />
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Location Status */}
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              location
                ? 'bg-success/10 border-2 border-success'
                : locationError
                ? 'bg-destructive/10 border-2 border-destructive'
                : 'bg-muted border-2 border-border'
            }`}
          >
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
                  <button onClick={getLocation} className="text-xs text-primary underline">
                    Try again
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Demo: simulate a spoofed reading */}
          <button
            onClick={() => {
              setLocationError('');
              setLocation({ latitude: 12, longitude: 77 });
              setSpoofReason('Mock location provider detected (whole-number coordinates).');
            }}
            className="text-xs text-primary underline"
          >
            Demo: simulate spoofed location
          </button>

          {/* Spoof warning */}
          {location && spoofReason && (
            <div className="space-y-1.5">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border-2 border-destructive">
                <ShieldAlert size={20} className="text-destructive mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-destructive">Location couldn't be verified</p>
                  <p className="text-xs text-muted-foreground">
                    This device appears to be using a mock or altered location. You can still check
                    in, but this visit will be recorded as location-unverified and shared with your
                    PSM for review.
                  </p>
                  <button onClick={getLocation} className="text-xs text-primary underline mt-1">
                    Re-check location
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground px-1">
                If you're not using a fake-GPS app, turn off mock locations in your device settings
                and re-check.
              </p>
            </div>
          )}


          {/* Live Photo */}
          <div className="space-y-2">
            <label className="font-medium">Live Photo Proof *</label>
            <p className="text-xs text-muted-foreground">
              Only live camera capture is allowed — gallery uploads are disabled.
            </p>

            {photoUrl ? (
              <div className="relative">
                <img
                  src={photoUrl}
                  alt="Live check-in proof"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={retakePhoto}
                  className="absolute bottom-2 right-2 bg-card border-2 border-border px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 touch-feedback"
                >
                  <RefreshCw size={14} /> Retake
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative bg-muted rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                  {!isCameraReady && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
                      {cameraError ? (
                        <>
                          <Camera size={28} className="text-destructive" />
                          <p className="text-xs text-destructive">{cameraError}</p>
                          <button onClick={startCamera} className="text-xs text-primary underline">
                            Retry camera
                          </button>
                        </>
                      ) : (
                        <>
                          <Loader2 size={24} className="animate-spin text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Starting camera...</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <button
                  onClick={capturePhoto}
                  disabled={!isCameraReady}
                  className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Camera size={18} />
                  <span>Capture Live Photo</span>
                </button>
              </div>
            )}
          </div>

          {/* Retailer Attendance */}
          <div className="space-y-2">
            <label className="font-medium">Retailers Met *</label>
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No retailers were planned for this visit.
              </p>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Mark attendance — select every retailer you actually met.
                </p>
                <div className="space-y-2">
                  {agents.map((agent) => {
                    const selected = metAgentIds.includes(agent.id);
                    return (
                      <button
                        key={agent.id}
                        onClick={() => toggleAgent(agent.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left touch-feedback ${
                          selected ? 'border-success bg-success/10' : 'border-border bg-card'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            selected ? 'border-success bg-success' : 'border-border'
                          }`}
                        >
                          {selected && <Check size={14} className="text-success-foreground" />}
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{agent.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {agent.location}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {metAgentIds.length} of {agents.length} retailers marked present
                </p>
              </>
            )}
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
            disabled={!canSubmit}
            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Check In
          </button>
        </div>
      </div>

      <AlertDialog open={showSpoofDialog} onOpenChange={setShowSpoofDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-destructive" />
              Location couldn't be verified
            </AlertDialogTitle>
            <AlertDialogDescription>
              We couldn't verify this device's location. You can still check in, but this visit will
              be recorded as location-unverified and shared with your PSM for review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={getLocation}>Re-check location</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSpoofDialog(false);
                submitCheckIn();
              }}
            >
              Check in anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
