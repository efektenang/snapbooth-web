export interface UserProfile {
  name: string;
  email: string;
  instagram?: string;
}

export interface PhotoAdjustment {
  x: number;
  y: number;
  scale: number;
}

export interface Template {
  id: string;
  name: string;
  previewUrl: string;
  overlayUrl?: string;
  aspectRatio: "3:4" | "1:1" | "9:16";
  gridSize: 4 | 6;
  layout: {
    cols: number;
    rows: number;
  };
}

export type AppStep = "landing" | "payment" | "profile" | "template" | "camera" | "editing" | "result";
