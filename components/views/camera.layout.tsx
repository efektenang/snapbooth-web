import { Template } from "@/lib/types";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera } from "lucide-react";

function CameraView({ template, onComplete }: { template: Template, onComplete: (imgs: string[]) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [shotsTaken, setShotsTaken] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraReady(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
        alert("Please allow camera access to use the photobooth.");
      }
    }
    setupCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startSession = async () => {
    setIsCapturing(true);
    const images: string[] = [];

    for (let i = 0; i < template.gridSize; i++) {
      // Countdown
      for (let c = 5; c > 0; c--) {
        setCountdown(c);
        await new Promise(r => setTimeout(r, 1000));
      }
      setCountdown(null);

      // Flash effect could be added here
      const img = capture();
      if (img) {
        images.push(img);
        setShotsTaken([...images]);
      }

      // Short pause between shots
      await new Promise(r => setTimeout(r, 500));
    }

    onComplete(images);
  };

  const capture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        const targetWidth = 1200;
        const targetHeight = 1200; // Square shots for grid
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        context.translate(canvas.width, 0);
        context.scale(-1, 1);

        const videoRatio = video.videoWidth / video.videoHeight;
        const targetRatio = targetWidth / targetHeight;

        let sw, sh, sx, sy;
        if (videoRatio > targetRatio) {
          sh = video.videoHeight;
          sw = sh * targetRatio;
          sx = (video.videoWidth - sw) / 2;
          sy = 0;
        } else {
          sw = video.videoWidth;
          sh = sw / targetRatio;
          sx = 0;
          sy = (video.videoHeight - sh) / 2;
        }

        context.drawImage(video, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        context.setTransform(1, 0, 0, 1, 0, 0);

        return canvas.toDataURL("image/png");
      }
    }
    return null;
  };

  return (
    <motion.div
      key="camera-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative w-full max-w-4xl mx-auto flex flex-col md:flex-row gap-8 items-center"
    >
      <div className="relative flex-1 aspect-square bg-black rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="hidden" />

        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <span className="text-white text-9xl font-black italic drop-shadow-2xl">{countdown}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-6 left-6 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          {isCapturing ? `Shot ${shotsTaken.length + 1} of ${template.gridSize}` : "Ready"}
        </div>
      </div>

      <div className="w-full md:w-64 space-y-6">
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: template.gridSize }).map((_, i) => (
            <div key={i} className="aspect-square bg-[#E7E5E4] rounded-xl overflow-hidden border-2 border-white shadow-sm">
              {shotsTaken[i] ? (
                <img src={shotsTaken[i]} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#A8A29E]">
                  {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>

        {!isCapturing && isCameraReady && (
          <button
            onClick={startSession}
            className="w-full py-4 bg-[#1C1917] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-transform"
          >
            Start Session
            <Camera className="w-5 h-5" />
          </button>
        )}

        {isCapturing && (
          <div className="text-center text-sm font-medium text-[#78716C] animate-pulse">
            Capturing moment...
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default CameraView;