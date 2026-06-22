import React, { useRef, useState, useEffect } from "react";
import { Sparkles, View, RefreshCw, AlertTriangle } from "lucide-react";

interface ShawarmaModelViewerProps {
  /** Relative or absolute URL of the 3D model (GLB) */
  src?: string;
  /** iOS-compatible USDZ model URL (optional) */
  iosSrc?: string;
  /** Alternative text for accessibility */
  alt?: string;
  /** Custom CSS classes for the outer wrapper */
  className?: string;
  /** Shadow intensity for realistic ground contact */
  shadowIntensity?: string;
  /** Auto-rotation behavior toggle */
  autoRotate?: boolean;
}

export function ShawarmaModelViewer({
  src = "/3d_shawarma_sample-v1.glb",
  iosSrc = "",
  alt = "Premium Shawarma Wrap 3D Specimen",
  className = "",
  shadowIntensity = "1.2",
  autoRotate = true,
}: ShawarmaModelViewerProps) {
  const modelViewerRef = useRef<any>(null);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isArSupported, setIsArSupported] = useState(true);

  useEffect(() => {
    const viewer = modelViewerRef.current;
    if (!viewer) return;

    // Monitor loading progress of the GLB model
    const handleProgress = (event: any) => {
      const details = event.detail || {};
      const totalProgress = details.totalProgress || 0;
      setProgress(Math.round(totalProgress * 100));
    };

    const handleLoad = () => {
      setIsLoaded(true);
      setLoadError(false);
    };

    const handleError = (error: any) => {
      console.error("Error loading model-viewer 3D graphics:", error);
      setLoadError(true);
    };

    // Check AR-support on component mount
    if (viewer.canActivateAR === false) {
      setIsArSupported(false);
    }

    viewer.addEventListener("progress", handleProgress);
    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    return () => {
      viewer.removeEventListener("progress", handleProgress);
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, []);

  const handleResetCamera = () => {
    const viewer = modelViewerRef.current;
    if (viewer) {
      viewer.cameraOrbit = "0deg 75deg auto";
      viewer.cameraTarget = "0m 0m 0m";
    }
  };

  return (
    <div className={`relative bg-stone-50 rounded-3xl shadow-inner border border-stone-200/80 overflow-hidden aspect-square flex items-center justify-center group isolate select-none ${className}`}>
      
      {/* 3D Model Viewer Canvas */}
      <model-viewer
        ref={modelViewerRef}
        src={src}
        ios-src={iosSrc}
        alt={alt}
        auto-rotate={autoRotate ? "" : undefined}
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity={shadowIntensity}
        shadow-softness="1"
        exposure="1.1"
        environment-image="neutral"
        className="w-full h-full bg-transparent z-0"
        style={{ width: "100%", height: "100%", backgroundColor: "transparent" }}
      >
        {/* Poster Slot (Visible while downloading and compiling GLB mesh) */}
        {!isLoaded && (
          <div slot="poster" className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 p-6 text-center transition-opacity duration-500 z-10">
            {/* Custom Circular Loading Tracker */}
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-stone-200 fill-none"
                  strokeWidth="4"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  className="stroke-brand-primary fill-none transition-all duration-300"
                  strokeWidth="4"
                  strokeDasharray={213}
                  strokeDashoffset={213 - (213 * progress) / 100}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-xs font-bold text-brand-text">{progress}%</span>
              </div>
            </div>
            
            <h4 className="font-heading font-bold text-sm text-brand-text">DailyBread 3D Graphics</h4>
            <p className="text-[10px] text-stone-500 mt-1 max-w-[200px] leading-relaxed">
              Downloading high-fidelity 3D mesh model of our signature wrap...
            </p>
          </div>
        )}

        {/* Custom Quick-Activation AR Trigger Button */}
        <button
          slot="ar-button"
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white text-brand-text px-6 py-3.5 rounded-full font-black shadow-xl border border-stone-205 flex items-center gap-2 hover:bg-stone-50 transition-all transform hover:scale-105 active:scale-95 cursor-pointer z-20 text-xs font-ui uppercase tracking-wider"
        >
          <View size={15} className="text-brand-primary animate-pulse" />
          <span>PROJECT AR IN ROOM</span>
        </button>

      </model-viewer>

      {/* Floating Controls Overlay (Top Right Indicator Badges) */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
        <div className="bg-stone-900/95 text-brand-bg text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-md shadow-sm font-mono flex items-center gap-1.5 backdrop-blur-sm">
          <span>SPECIMEN: SHAWARRMA</span>
        </div>
        {isLoaded && (
          <div className="bg-emerald-500/90 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-sm font-mono flex items-center gap-1.5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            <span>WebGL Render active</span>
          </div>
        )}
      </div>

      {/* Dynamic Reset Camera Angle Trigger (Bottom Right Floating Panel) */}
      {isLoaded && (
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button
            onClick={handleResetCamera}
            className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 shadow border border-stone-150 flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm"
            title="Reset Camera Viewport"
          >
            <RefreshCw size={13} className="text-brand-text" />
          </button>
        </div>
      )}

      {/* AR Device Capability Disclaimer Alert Overlay */}
      {!isArSupported && (
        <div className="absolute bottom-4 right-4 bg-stone-900/90 backdrop-blur-sm border border-stone-800 p-1.5 px-3 rounded-md text-[9px] text-stone-300 font-mono flex items-center gap-1.5 z-10 shadow select-none pointer-events-none">
          <AlertTriangle size={10} className="text-yellow-500" />
          <span>Device doesn't support WebXR AR Projection</span>
        </div>
      )}

      {/* Graceful Fallback Warning Box for Loading Failure */}
      {loadError && (
        <div className="absolute bottom-4 left-4 right-4 bg-amber-50/95 border border-amber-200 p-3 rounded-xl shadow-lg z-10 flex items-start gap-2.5 text-stone-850">
          <AlertTriangle size={16} className="text-amber-650 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[11px] block text-amber-900">3D Specimen Load Failure</span>
            <span className="text-[10px] text-stone-600 block mt-0.5 leading-snug">
              Vercel local directory could not locate '/3d_shawarma_sample-v1.glb'. Verify file is present inside '/public'.
            </span>
          </div>
        </div>
      )}

    </div>
  );
}
