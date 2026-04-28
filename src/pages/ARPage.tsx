import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Dish } from '../types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Environment } from '@react-three/drei';
import { DishModel } from '../components/AR/DishModel';
import { ARButton, XR, createXRStore } from '@react-three/xr';
import { motion } from 'motion/react';
import { ArrowLeft, Scan, Info, AlertTriangle, Flame } from 'lucide-react';

const store = createXRStore({
  depthSensing: true,
  hand: true,
});

export default function ARPage() {
  const { dishId } = useParams<{ dishId: string }>();
  const [dish, setDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dishId) return;
    
    // Check for "scan" pseudo-id
    if (dishId === 'scan') {
        // Handle general scan mode if needed
        setLoading(false);
        return;
    }

    const fetchDish = async () => {
      try {
        const docRef = doc(db, 'dishes', dishId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDish({ id: docSnap.id, ...docSnap.data() } as Dish);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `dishes/${dishId}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDish();
  }, [dishId]);

  if (loading) return <div className="p-20 text-center font-mono opacity-50 uppercase">Loading Experience...</div>;

  if (!dish && dishId !== 'scan') {
    return (
      <div className="p-20 text-center">
        <h2 className="text-4xl font-bold uppercase mb-4">Dish Not Found</h2>
        <Link to="/menu" className="text-sm font-bold underline">BACK TO MENU</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] overflow-hidden">
      <div className="flex-1 relative flex flex-col items-stretch overflow-hidden">
        
        {/* Top Info Badge - Hidden on small mobile */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 hidden sm:flex items-center gap-4">
            <div className="glass-panel px-6 py-2 rounded-full flex items-center gap-3">
                <div className="w-2.5 h-2.5 bg-[#FF6B35] rounded-full animate-pulse shadow-[0_0_10px_rgba(255,107,53,0.6)]"></div>
                <span className="text-[9px] lg:text-[10px] font-bold tracking-[0.2em] uppercase text-gray-600">DailyBread AR Server Connected</span>
            </div>
        </div>

        {/* HUD Panels: Left Info & Right Controls */}
        <div className="absolute inset-x-0 bottom-0 lg:inset-x-auto lg:top-1/2 lg:left-10 lg:-translate-y-1/2 z-40 p-4 lg:p-0">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="w-full lg:w-96 glass-panel p-6 lg:p-10 rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl lg:shadow-none"
            >
              <div className="flex justify-between items-center lg:block">
                <Link to="/menu" className="flex items-center gap-2 text-[10px] font-bold text-[#FF6B35] hover:opacity-70 mb-0 lg:mb-8 uppercase tracking-[0.3em] font-sans">
                  <ArrowLeft className="w-3 h-3" />
                  Menu
                </Link>
                {dish && <div className="lg:hidden text-[#FF6B35] font-mono text-lg font-black">${dish.price}</div>}
              </div>

              {dish ? (
                <div className="mt-4 lg:mt-0">
                  <div className="hidden lg:block text-[11px] font-bold text-[#FF6B35] uppercase tracking-[0.2em] mb-2 opacity-60">Visualizing Freshness</div>
                  <h1 className="text-2xl lg:text-4xl font-black text-[#2D2D2D] uppercase tracking-tighter leading-[1] mb-2 lg:mb-6 whitespace-nowrap overflow-hidden text-ellipsis">
                    {dish.name}
                  </h1>
                  
                  <div className="hidden lg:grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 mb-8">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Price</div>
                        <div className="text-[#FF6B35] font-mono text-2xl font-black">${dish.price}</div>
                      </div>
                      {dish.calories && (
                        <div>
                            <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Energy</div>
                            <div className="text-[#2D2D2D] font-mono text-2xl font-black">{dish.calories} <span className="text-[10px] opacity-40 font-bold">KCAL</span></div>
                        </div>
                      )}
                  </div>

                  <p className="hidden lg:block text-sm text-gray-500 leading-relaxed mb-8 font-medium">
                    {dish.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4 mt-6">
                    <ARButton 
                      store={store}
                      className="flex-1 btn-primary !py-4 lg:!py-5 uppercase tracking-[0.2em] text-[10px] lg:text-xs font-black flex items-center justify-center"
                    >
                      <Scan className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                      START AR
                    </ARButton>
                    <a 
                      href={`/ar.html?model=${dish.modelUrl}`}
                      className="flex-1 btn-glass !py-4 lg:!py-5 uppercase tracking-[0.2em] text-[10px] lg:text-xs font-black flex items-center justify-center !text-[#FF6B35] !border-[#FF6B35]/20"
                    >
                      <Scan className="w-4 h-4 lg:w-5 lg:h-5 mr-3" />
                      MARKER MODE
                    </a>
                    <div className="hidden sm:flex lg:hidden flex-col items-center justify-center flex-1">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#FF6B35] animate-pulse">Scanning Ready</span>
                        <span className="text-[8px] text-gray-400 uppercase tracking-tighter text-center">Table calibration active</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 lg:py-12 text-center">
                    <Scan className="w-12 lg:w-16 h-12 lg:h-16 text-[#FF6B35] opacity-20 mb-4 lg:mb-6 animate-pulse" />
                    <h3 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-[#2D2D2D]">Universal Viewer</h3>
                    <ARButton store={store} className="mt-6 lg:mt-8 btn-primary !py-4 w-full uppercase text-[10px] tracking-widest mb-3">START SCANNING</ARButton>
                    <a href="/ar.html?model=https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@main/sample-shawarma.glb" className="btn-glass !py-4 w-full uppercase text-[10px] tracking-widest text-center !text-[#FF6B35]">USE HIRO MARKER</a>
                </div>
              )}
            </motion.div>
        </div>

        {/* Quick Actions HUD - Repositioned for Mobile */}
        <div className="absolute right-4 top-4 lg:right-10 lg:top-1/2 lg:-translate-y-1/2 flex lg:flex-col gap-3 lg:gap-4 z-40">
            <button className="glass-panel w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-[#2D2D2D] hover:bg-[#FF6B35] hover:text-white transition-all shadow-xl">
                <Scan className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
            <button className="glass-panel w-10 h-10 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl flex items-center justify-center text-[#2D2D2D] hover:bg-gray-50 transition-all shadow-xl">
                <Info className="w-5 h-5 lg:w-6 lg:h-6" />
            </button>
        </div>

        {/* 3D View Area */}
        <div className="flex-1 bg-[#FFFDF5] relative z-10">
          <div className="camera-simulation absolute inset-0 opacity-40 pointer-events-none"></div>
          <div className="dish-placeholder absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10"></div>
          <div className="reticle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          
          <Canvas shadows>
            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
            <OrbitControls makeDefault enableDamping minDistance={2} maxDistance={10} />
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
            <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
            
            <XR store={store}>
              <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2 }}>
                {(dish || dishId === 'scan') && (
                  <DishModel 
                    url={dish?.modelUrl || 'https://cdn.jsdelivr.net/gh/lou-sys499/dailybread_shawarma_webar@main/sample-shawarma.glb'} 
                    scale={1} 
                  />
                )}
              </Stage>
            </XR>
            <Environment preset="city" />
            <gridHelper args={[20, 20, 0x000000, 0x000000]} position={[0, -0.5, 0]} rotation={[0, 0, 0]}>
                <meshStandardMaterial opacity={0.05} transparent />
            </gridHelper>
          </Canvas>

          <div className="absolute bottom-6 right-6 font-mono text-[10px] opacity-20 uppercase tracking-[0.3em] font-black hidden lg:block">
              Rendering 60FPS Virtual Asset
          </div>
        </div>
      </div>
    </div>
  );
}
