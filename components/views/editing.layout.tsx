import { PhotoAdjustment, Template } from "@/lib/types";
import { useRef, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Move, ZoomIn, ZoomOut } from "lucide-react";

export default function EditingView({ images, template, adjustments, onUpdate, onComplete }: {
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