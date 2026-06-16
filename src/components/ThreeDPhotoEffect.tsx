import React, { useRef, useEffect, useState } from "react";
import { Star, MapPin, Clock } from "lucide-react";

interface ThreeDPhotoEffectProps {
  className?: string;
}

export function ThreeDPhotoEffect({ className = "" }: ThreeDPhotoEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const fgRef = useRef<HTMLImageElement>(null);
  const shadowRef = useRef<HTMLImageElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  // Animation values using refs to avoid re-renders
  const state = useRef({
    targetX: 0,
    targetY: 0,
    targetZoom: 1,
    currentX: 0,
    currentY: 0,
    currentZoom: 1,
    isHovered: false,
    hasGyro: false,
    reducedMotion: false,
    gyroBaseline: null as { beta: number; gamma: number } | null,
  });

  // Manage permission UI state
  const [showPermissionBanner, setShowPermissionBanner] = useState(false);
  const [isGyroActive, setIsGyroActive] = useState(false);

  useEffect(() => {
    // Detect system reduced motion configuration
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    state.current.reducedMotion = mediaQuery.matches;
    const handleMotionQueryChange = (e: MediaQueryListEvent) => {
      state.current.reducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", handleMotionQueryChange);

    // Check if permission is needed on iOS devices
    const needsPermission =
      typeof window !== "undefined" &&
      typeof DeviceOrientationEvent !== "undefined" &&
      typeof (DeviceOrientationEvent as any).requestPermission === "function";

    if (needsPermission) {
      setShowPermissionBanner(true);
    } else {
      // Auto-start for browsers/devices that do not block by default
      window.addEventListener("deviceorientation", handleDeviceOrientation);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleMotionQueryChange);
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
    };
  }, []);

  const requestGyroPermission = async () => {
    const DeviceOrientation = DeviceOrientationEvent as any;
    if (typeof DeviceOrientation.requestPermission === "function") {
      try {
        const permission = await DeviceOrientation.requestPermission();
        if (permission === "granted") {
          window.addEventListener("deviceorientation", handleDeviceOrientation);
          setIsGyroActive(true);
          setShowPermissionBanner(false);
        } else {
          alert("Orientation tracking permission denied. The 3D view will use cursor-tracking on desktops.");
          setShowPermissionBanner(false);
        }
      } catch (err) {
        console.error("Error requesting DeviceOrientation permission:", err);
        setShowPermissionBanner(false);
      }
    }
  };

  const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
    if (event.beta === null || event.gamma === null || state.current.reducedMotion) return;
    
    state.current.hasGyro = true;
    setIsGyroActive(true);

    // Capture initial holding angle baseline to measure relative deviations
    if (!state.current.gyroBaseline) {
      state.current.gyroBaseline = { beta: event.beta, gamma: event.gamma };
    }

    // Measure deviation and clamp to keep movements elegantly contained
    const maxDeviation = 20;
    const deltaBeta = event.beta - state.current.gyroBaseline.beta;
    const deltaGamma = event.gamma - state.current.gyroBaseline.gamma;

    const clampedBeta = Math.max(-maxDeviation, Math.min(maxDeviation, deltaBeta));
    const clampedGamma = Math.max(-maxDeviation, Math.min(maxDeviation, deltaGamma));

    // Map device rotation to elegant X and Y tilts (Pitch controls X-axis, Roll controls Y-axis, max 10 deg)
    state.current.targetX = -(clampedBeta / maxDeviation) * 10;
    state.current.targetY = (clampedGamma / maxDeviation) * 10;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (state.current.reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    state.current.isHovered = true;
    state.current.targetZoom = 1.04;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates from the center (-1 to 1)
    const normalizedX = (x / rect.width) * 2 - 1;
    const normalizedY = (y / rect.height) * 2 - 1;

    // Direct X and Y degrees (max 10 degrees angle deviation for elegant performance)
    state.current.targetY = normalizedX * 10;
    state.current.targetX = -normalizedY * 10;
  };

  const handleMouseLeave = () => {
    state.current.isHovered = false;
    state.current.targetZoom = 1.0;

    // Reset rotation baseline if gyroscope isn't overriding
    if (!state.current.hasGyro) {
      state.current.targetX = 0;
      state.current.targetY = 0;
    }
  };

  // Dedicated dynamic ticking animation frame loop to avoid expensive React state calculations
  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      const s = state.current;
      
      if (s.reducedMotion) {
        if (cardRef.current) {
          cardRef.current.style.transform = "none";
        }
        if (shadowRef.current) {
          shadowRef.current.style.transform = "translate3d(0, 0, 15px) scale(0.98)";
          shadowRef.current.style.opacity = "0.4";
        }
        animationFrameId = requestAnimationFrame(tick);
        return;
      }

      const lerpFactor = 0.08;

      // Smooth interpolation for inertia and responsive gliding
      s.currentX += (s.targetX - s.currentX) * lerpFactor;
      s.currentY += (s.targetY - s.currentY) * lerpFactor;
      s.currentZoom += (s.targetZoom - s.currentZoom) * lerpFactor;

      // Add continuous organic floating movement (simulating suspended 3D subject)
      const time = performance.now() * 0.0012;
      const floatX = Math.cos(time * 0.7) * 2;
      const floatY = Math.sin(time) * 4.5;
      const floatZ = Math.sin(time * 1.1) * 3;

      // 1. Mutate card wrapper container matrices (Only foreground objects move, background is completely static)
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${s.currentX}deg) rotateY(${s.currentY}deg) translate3d(${floatX}px, ${floatY}px, ${floatZ}px) scale(${s.currentZoom})`;
      }

      // 2. Adjust dynamic soft shadow beneath the object that shifts slightly with rotation & float
      if (shadowRef.current) {
        const shadowMaxShiftX = -8; // Opposite to tilt Y rotation
        const shadowMaxShiftY = 8;  // Opposite to tilt X rotation
        
        const shiftX = (s.currentY / 10) * shadowMaxShiftX + (floatX * -0.6);
        const shiftY = -(s.currentX / 10) * shadowMaxShiftY + (floatY * -0.6);

        // Shrink and dim shadow dynamically as object floats further from original depth
        const shadowScale = 0.96 - (floatZ * 0.004);
        const shadowOpacity = 0.38 + (floatZ * 0.012);

        shadowRef.current.style.transform = `translate3d(${shiftX}px, ${shiftY}px, 10px) scale(${shadowScale})`;
        shadowRef.current.style.opacity = `${shadowOpacity}`;
      }

      // 3. Glare reflection shift based on rotation coordinates
      if (glareRef.current) {
        const glarePercentX = 50 + (s.currentY / 10) * 35;
        const glarePercentY = 50 + (s.currentX / 10) * 35;
        const tiltMagnitude = Math.sqrt(s.currentX * s.currentX + s.currentY * s.currentY);
        const glareOpacity = 0.12 + (tiltMagnitude / 10) * 0.12;

        glareRef.current.style.background = `radial-gradient(circle at ${glarePercentX}% ${glarePercentY}%, rgba(255, 255, 255, ${glareOpacity}) 0%, rgba(255, 255, 255, 0) 65%)`;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-3xl overflow-hidden aspect-square shadow-2xl border border-brand-text/10 bg-slate-900 group select-none ${className}`}
      style={{ perspective: "1200px" }}
    >
      {/* 1. Static Scene Background - Left perfectly fixed and stable at all times to eliminate artificial "sliding visual layers" */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img
          ref={bgRef}
          src="https://i.ibb.co/N8yGLGk/wrap-2.png"
          alt="Delicious surrounding stack background scenery"
          className="w-full h-full object-cover select-none pointer-events-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* 2. Interactive 3D Canvas - Solely animates the foreground subject, shadow, and glare overlay for high-fidelity realism */}
      <div
        ref={cardRef}
        className="w-full h-full absolute inset-0 z-10"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.08s ease-out",
        }}
      >
        {/* Layer 2A: Adaptive Dynamic Drop Shadow */}
        <img
          ref={shadowRef}
          src="https://i.ibb.co/BvbSXx9/wrap-1.png"
          alt="Realistic dynamic drop silhouette"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none filter blur-xl brightness-0 opacity-40 mix-blend-multiply z-10 transition-opacity duration-300"
          style={{
            transform: "translate3d(0px, 0px, 12px) scale(0.96)",
          }}
          referrerPolicy="no-referrer"
        />

        {/* Layer 2B: Foreground Shawarma cutout - Clean transparent file with no text inside */}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center z-20"
          style={{
            transform: "translateZ(35px) scale(1.02)",
            transformStyle: "preserve-3d",
          }}
        >
          <img
            ref={fgRef}
            src="https://i.ibb.co/BvbSXx9/wrap-1.png"
            alt="Handcrafted dynamic premium shawarma slice cutout"
            className="w-full h-full object-cover select-none pointer-events-none antialiased"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Layer 2C: Interactive Ambient Glare/Specular Highlight overlay */}
        <div
          ref={glareRef}
          className="absolute inset-0 pointer-events-none mix-blend-overlay z-30"
          style={{
            transform: "translateZ(38px)",
            background: "radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0) 65%)",
          }}
        />
      </div>

      {/* Gyroscope / iOS Activation buttons overlay */}
      {showPermissionBanner && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center text-white z-50 animate-fade-in font-ui">
          <p className="text-sm font-bold mb-3 max-w-xs">Activate mobile Gyroscope tracking for full 3D visual tilt experience!</p>
          <button
            onClick={requestGyroPermission}
            className="px-5 py-2.5 bg-brand-primary hover:bg-brand-accent-2 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Activate 3D View
          </button>
          <button
            onClick={() => setShowPermissionBanner(false)}
            className="mt-3 text-[10px] text-stone-400 underline hover:text-white"
          >
            Dismiss (Use manual dragging)
          </button>
        </div>
      )}

      {/* Mini state badge for sensor verification when tracking is active on mobile */}
      {isGyroActive && (
        <div className="absolute top-2 left-2 bg-black/70 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded-full text-[8.5px] font-mono tracking-wider z-50 flex items-center gap-1 select-none">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          <span>3D TILT ACTIVE</span>
        </div>
      )}
    </div>
  );
}
