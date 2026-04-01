"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Download, 
  RefreshCcw, 
  CreditCard, 
  User, 
  CheckCircle2, 
  ChevronRight,
  Instagram,
  Mail,
  Move,
  ZoomIn,
  ZoomOut,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { UserProfile, Template, AppStep, PhotoAdjustment } from "@/lib/types";

// --- Constants ---
const TEMPLATES: Template[] = [
  { 
    id: "classic-4", 
    name: "Classic 2x2", 
    previewUrl: "https://picsum.photos/seed/white/300/400", 
    aspectRatio: "3:4", 
    gridSize: 4, 
    layout: { cols: 2, rows: 2 } 
  },
  { 
    id: "modern-6", 
    name: "Modern 2x3", 
    previewUrl: "https://picsum.photos/seed/dark/300/400", 
    aspectRatio: "3:4", 
    gridSize: 6, 
    layout: { cols: 2, rows: 3 } 
  },
  { 
    id: "vintage-4", 
    name: "Vintage 2x2", 
    previewUrl: "https://picsum.photos/seed/vintage/300/400", 
    aspectRatio: "3:4", 
    gridSize: 4, 
    layout: { cols: 2, rows: 2 } 
  },
  { 
    id: "neon-6", 
    name: "Neon 2x3", 
    previewUrl: "https://picsum.photos/seed/neon/300/400", 
    aspectRatio: "3:4", 
    gridSize: 6, 
    layout: { cols: 2, rows: 3 } 
  },
];

const PRICE = 50000; // IDR

export default function Page() {
  const [step, setStep] = useState<AppStep>("landing");
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "" });
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(TEMPLATES[0]);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [adjustments, setAdjustments] = useState<PhotoAdjustment[]>([]);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (step === "editing" && adjustments.length === 0) {
      setAdjustments(capturedImages.map(() => ({ x: 0, y: 0, scale: 1 })));
    }
  }, [step, capturedImages, adjustments.length]);

  // Midtrans Snap handler
  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: PRICE }),
      });
      const data = await response.json();

      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token, {
          onSuccess: (result: any) => {
            console.log("Success:", result);
            setStep("profile");
          },
          onPending: (result: any) => {
            console.log("Pending:", result);
            alert("Payment is pending. Please complete it to continue.");
          },
          onError: (result: any) => {
            console.error("Error:", result);
            alert("Payment failed. Please try again.");
          },
          onClose: () => {
            console.log("Customer closed the popup without finishing the payment");
          },
        });
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initialize payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F4] text-[#1C1917] font-sans selection:bg-[#E7E5E4]">
      {/* Navigation / Header */}
      <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1C1917] rounded-full flex items-center justify-center">
            <Camera className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold tracking-tight text-xl">SnapBooth</span>
        </div>
        <div className="flex gap-4">
          {step !== "landing" && (
            <button 
              onClick={() => setStep("landing")}
              className="text-sm font-medium opacity-50 hover:opacity-100 transition-opacity"
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      <main className="pt-24 pb-12 px-6 max-w-4xl mx-auto min-h-screen flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {step === "landing" && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none">
                  CAPTURE<br />THE MOMENT.
                </h1>
                <p className="text-lg text-[#57534E] max-w-md mx-auto">
                  Premium digital photobooth experience. Pay once, capture forever.
                </p>
              </div>
              
              <div className="flex flex-col items-center gap-4">
                <button
                  onClick={() => setStep("payment")}
                  className="group relative px-8 py-4 bg-[#1C1917] text-white rounded-full font-semibold text-lg flex items-center gap-3 overflow-hidden transition-transform active:scale-95"
                >
                  <span className="relative z-10">Start Experience</span>
                  <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                </button>
                <p className="text-sm text-[#A8A29E] flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  IDR {PRICE.toLocaleString()} per session
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-12">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-[3/4] bg-[#E7E5E4] rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                    <img 
                      src={`https://picsum.photos/seed/booth${i}/400/600`} 
                      alt="Sample" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-md mx-auto w-full bg-white rounded-[32px] p-8 shadow-xl shadow-black/5 space-y-8"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-[#F5F5F4] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-[#1C1917]" />
                </div>
                <h2 className="text-2xl font-bold">Secure Payment</h2>
                <p className="text-[#78716C]">Complete payment to unlock the booth.</p>
              </div>

              <div className="bg-[#F5F5F4] rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[#78716C]">Session Fee</span>
                  <span className="font-bold">IDR {PRICE.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#78716C]">Includes</span>
                  <span className="text-right">Unlimited retakes & Digital Download</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full py-4 bg-[#1C1917] text-white rounded-2xl font-bold flex items-center justify-center gap-3 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isProcessing ? "Initializing..." : "Pay with Midtrans"}
                {!isProcessing && <ChevronRight className="w-5 h-5" />}
              </button>
              
              <p className="text-center text-xs text-[#A8A29E]">
                Securely processed by Midtrans. All major payment methods supported.
              </p>
            </motion.div>
          )}

          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-md mx-auto w-full space-y-8"
            >
              <div className="space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">Set your profile.</h2>
                <p className="text-[#78716C]">Where should we send your digital copies?</p>
              </div>

              <form 
                onSubmit={(e) => { e.preventDefault(); setStep("template"); }}
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-[#A8A29E]">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
                      <input 
                        required
                        type="text"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-[#E7E5E4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C1917] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-[#A8A29E]">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
                      <input 
                        required
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-[#E7E5E4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C1917] transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold uppercase tracking-wider text-[#A8A29E]">Instagram (Optional)</label>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]" />
                      <input 
                        type="text"
                        value={profile.instagram}
                        onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                        placeholder="@username"
                        className="w-full pl-12 pr-4 py-4 bg-white border border-[#E7E5E4] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#1C1917] transition-all"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#1C1917] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  Continue to Booth
                  <ChevronRight className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}

          {step === "template" && (
            <motion.div
              key="template"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">Choose your vibe.</h2>
                <p className="text-[#78716C]">Select a template for your session.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTemplate(t)}
                    className={cn(
                      "group relative aspect-[3/4] rounded-3xl overflow-hidden border-4 transition-all duration-300",
                      selectedTemplate.id === t.id ? "border-[#1C1917] scale-105 shadow-2xl" : "border-transparent opacity-60 hover:opacity-100"
                    )}
                  >
                    <img src={t.previewUrl} alt={t.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.name}
                    </div>
                    {selectedTemplate.id === t.id && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-[#1C1917] rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-center pt-8">
                <button
                  onClick={() => setStep("camera")}
                  className="px-12 py-4 bg-[#1C1917] text-white rounded-full font-bold text-lg flex items-center gap-3 transition-all active:scale-95"
                >
                  Enter Photobooth
                  <Camera className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === "camera" && (
            <CameraView 
              template={selectedTemplate} 
              onComplete={(imgs) => { 
                setCapturedImages(imgs); 
                setStep("editing"); 
              }} 
            />
          )}

          {step === "editing" && capturedImages.length > 0 && (
            <EditingView
              images={capturedImages}
              template={selectedTemplate}
              adjustments={adjustments}
              onUpdate={setAdjustments}
              onComplete={(final) => {
                setFinalImage(final);
                setStep("result");
              }}
            />
          )}

          {step === "result" && finalImage && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 flex flex-col items-center"
            >
              <div className="text-center space-y-2">
                <h2 className="text-4xl font-bold tracking-tight">Looking good!</h2>
                <p className="text-[#78716C]">Ready to save your memory?</p>
              </div>

              <div className="relative group">
                <div className={cn(
                  "bg-white p-4 shadow-2xl rounded-lg transform rotate-2 transition-transform hover:rotate-0 duration-500",
                  (selectedTemplate.id.includes("dark") || selectedTemplate.id.includes("neon")) && "bg-[#1C1917] text-white",
                  selectedTemplate.id.includes("vintage") && "sepia",
                )}>
                  <img src={finalImage} alt="Result" className="max-w-full md:max-w-md rounded shadow-inner" />
                  <div className="mt-4 flex justify-between items-center px-2">
                    <span className="text-xs font-mono opacity-50 uppercase tracking-widest">SnapBooth x {profile.name}</span>
                    <span className="text-xs font-mono opacity-50">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4 w-full max-w-md">
                <button
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = finalImage;
                    link.download = `snapbooth-${profile.name.toLowerCase().replace(/\s+/g, '-')}.png`;
                    link.click();
                    confetti({
                      particleCount: 150,
                      spread: 70,
                      origin: { y: 0.6 }
                    });
                  }}
                  className="flex-1 py-4 bg-[#1C1917] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  Download Photo
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { 
                    setCapturedImages([]); 
                    setAdjustments([]);
                    setFinalImage(null); 
                    setStep("camera"); 
                  }}
                  className="flex-1 py-4 bg-white border border-[#E7E5E4] text-[#1C1917] rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  Retake Photo
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Status */}
      <footer className="fixed bottom-0 left-0 w-full p-6 flex justify-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full border border-[#E7E5E4] shadow-sm flex items-center gap-6 text-[10px] font-bold uppercase tracking-widest text-[#A8A29E]">
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", step === "landing" ? "bg-[#1C1917]" : "bg-[#E7E5E4]")} />
            Start
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", step === "payment" ? "bg-[#1C1917]" : "bg-[#E7E5E4]")} />
            Pay
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", step === "profile" ? "bg-[#1C1917]" : "bg-[#E7E5E4]")} />
            Profile
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-1.5 h-1.5 rounded-full", step === "camera" ? "bg-[#1C1917]" : "bg-[#E7E5E4]")} />
            Capture
          </div>
        </div>
      </footer>
    </div>
  );
}

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

function EditingView({ images, template, adjustments, onUpdate, onComplete }: { 
  images: string[], 
  template: Template, 
  adjustments: PhotoAdjustment[],
  onUpdate: (adj: PhotoAdjustment[]) => void,
  onComplete: (final: string) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const updateAdj = (index: number, delta: Partial<PhotoAdjustment>) => {
    const newAdj = [...adjustments];
    newAdj[index] = { ...newAdj[index], ...delta };
    onUpdate(newAdj);
  };

  const generateFinal = async () => {
    setIsGenerating(true);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const slotSize = 600;
    const padding = 40;
    const headerHeight = 100;
    
    canvas.width = (slotSize * template.layout.cols) + (padding * (template.layout.cols + 1));
    canvas.height = (slotSize * template.layout.rows) + (padding * (template.layout.rows + 1)) + headerHeight;

    // Background
    ctx.fillStyle = (template.id.includes("dark") || template.id.includes("neon")) ? "#1C1917" : "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw each image
    for (let i = 0; i < images.length; i++) {
      const col = i % template.layout.cols;
      const row = Math.floor(i / template.layout.cols);
      const x = padding + col * (slotSize + padding);
      const y = padding + row * (slotSize + padding);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = images[i];
      await new Promise(r => img.onload = r);

      const adj = adjustments[i] || { x: 0, y: 0, scale: 1 };
      
      ctx.save();
      ctx.beginPath();
      ctx.rect(x, y, slotSize, slotSize);
      ctx.clip();

      const drawWidth = slotSize * adj.scale;
      const drawHeight = slotSize * adj.scale;
      const drawX = x + (slotSize - drawWidth) / 2 + adj.x;
      const drawY = y + (slotSize - drawHeight) / 2 + adj.y;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      // Filters
      if (template.id.includes("vintage")) {
        ctx.fillStyle = "rgba(112, 66, 20, 0.15)";
        ctx.fillRect(x, y, slotSize, slotSize);
      }
      
      ctx.restore();
    }

    // Neon Frame
    if (template.id.includes("neon")) {
      ctx.strokeStyle = "#00f2ff";
      ctx.lineWidth = 20;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
    }

    onComplete(canvas.toDataURL("image/png"));
  };

  return (
    <motion.div
      key="editing-view"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-4xl font-bold tracking-tight">Perfect your shots.</h2>
        <p className="text-[#78716C]">Adjust each photo in the grid.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-12 items-start justify-center">
        {/* Preview Grid */}
        <div className={cn(
          "p-4 rounded-2xl shadow-2xl grid gap-4",
          (template.id.includes("dark") || template.id.includes("neon")) ? "bg-[#1C1917]" : "bg-white",
          template.layout.cols === 2 ? "grid-cols-2" : "grid-cols-3"
        )}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative w-32 h-32 md:w-48 md:h-48 overflow-hidden rounded-lg border-4 transition-all",
                activeIndex === i ? "border-blue-500 scale-105 z-10" : "border-transparent opacity-80"
              )}
            >
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${img})`,
                  transform: `translate(${adjustments[i]?.x / 3}px, ${adjustments[i]?.y / 3}px) scale(${adjustments[i]?.scale})` 
                }}
              />
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="w-full max-w-sm space-y-8 bg-white p-8 rounded-[32px] shadow-xl border border-[#E7E5E4]">
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Move className="w-5 h-5" />
              Adjust Photo {activeIndex + 1}
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium">
                  <span>Zoom</span>
                  <span>{Math.round((adjustments[activeIndex]?.scale || 1) * 100)}%</span>
                </div>
                <div className="flex items-center gap-4">
                  <ZoomOut className="w-4 h-4 text-[#A8A29E]" />
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1"
                    value={adjustments[activeIndex]?.scale || 1}
                    onChange={(e) => updateAdj(activeIndex, { scale: parseFloat(e.target.value) })}
                    className="flex-1 h-2 bg-[#F5F5F4] rounded-lg appearance-none cursor-pointer accent-[#1C1917]"
                  />
                  <ZoomIn className="w-4 h-4 text-[#A8A29E]" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div />
                <button onClick={() => updateAdj(activeIndex, { y: (adjustments[activeIndex]?.y || 0) - 10 })} className="p-3 bg-[#F5F5F4] rounded-xl hover:bg-[#E7E5E4] flex justify-center"><ChevronRight className="w-5 h-5 -rotate-90" /></button>
                <div />
                <button onClick={() => updateAdj(activeIndex, { x: (adjustments[activeIndex]?.x || 0) - 10 })} className="p-3 bg-[#F5F5F4] rounded-xl hover:bg-[#E7E5E4] flex justify-center"><ChevronRight className="w-5 h-5 rotate-180" /></button>
                <div className="p-3 flex items-center justify-center text-xs font-bold text-[#A8A29E]">PAN</div>
                <button onClick={() => updateAdj(activeIndex, { x: (adjustments[activeIndex]?.x || 0) + 10 })} className="p-3 bg-[#F5F5F4] rounded-xl hover:bg-[#E7E5E4] flex justify-center"><ChevronRight className="w-5 h-5" /></button>
                <div />
                <button onClick={() => updateAdj(activeIndex, { y: (adjustments[activeIndex]?.y || 0) + 10 })} className="p-3 bg-[#F5F5F4] rounded-xl hover:bg-[#E7E5E4] flex justify-center"><ChevronRight className="w-5 h-5 rotate-90" /></button>
                <div />
              </div>
            </div>
          </div>

          <button
            onClick={generateFinal}
            disabled={isGenerating}
            className="w-full py-4 bg-[#1C1917] text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {isGenerating ? "Processing..." : "Finalize Grid"}
            <Check className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
