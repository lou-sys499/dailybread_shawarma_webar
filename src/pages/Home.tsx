import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Scan, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-65px)]">
      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center px-6 overflow-hidden">
        <div className="camera-simulation absolute inset-0 opacity-20 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12 md:py-20 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <div className="text-[10px] md:text-xs font-bold text-[#FF6B35] uppercase tracking-[0.4em] mb-4 md:mb-6">Fresh & Fast Shawarma Station</div>
            <h1 className="text-[15vw] sm:text-[12vw] lg:text-[7rem] font-sans font-black leading-[0.8] tracking-tighter uppercase mb-6 md:mb-8 text-[#2D2D2D]">
              Bite into <br />
              <span className="text-[#FF6B35] italic">Reality</span> <br />
              Daily
            </h1>
            <p className="text-lg md:text-xl max-w-md mx-auto lg:mx-0 text-gray-500 mb-8 md:mb-10 leading-relaxed font-medium">
              See your Shawarma in life-sized 3D before your first bite. 
              The future of fast food is here.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <Link 
                to="/menu" 
                className="btn-primary w-full sm:w-auto text-center"
              >
                VIEW SHAWARMAS
                <ArrowRight className="w-5 h-5 ml-2 inline" />
              </Link>
              <Link 
                to="/ar/scan" 
                className="btn-glass flex items-center justify-center gap-3 !py-3 !px-8 !text-sm w-full sm:w-auto"
              >
                <Scan className="w-5 h-5 text-[#FF6B35]" />
                SCAN MARKER
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative aspect-square"
          >
            <div className="dish-placeholder absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            <div className="reticle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            
            <img 
              src="https://drive.google.com/thumbnail?id=10dOGyx0HEXb5rBoVpbqDaCthB1yE-iPu&sz=w1200" 
              alt="Delicious Shawarma" 
              className="w-full h-full object-cover rounded-[3rem] shadow-2xl relative z-10 transition-all duration-700"
            />
            
            <div className="absolute -bottom-10 -right-10 glass-panel p-8 rounded-2xl shadow-xl z-20 max-w-xs rotate-3">
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#FF6B35] mb-2 font-bold">Portion Preview</p>
              <h3 className="font-sans font-bold text-lg leading-tight uppercase text-[#2D2D2D]">
                Life-sized <span className="text-[#FF6B35]">Shawarma</span> Visualization
              </h3>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="bg-white/50 border-t border-gray-100 py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="group">
              <div className="text-[#FF6B35] mb-6 font-mono font-black text-5xl opacity-20 group-hover:opacity-100 transition-opacity">01</div>
              <div className="h-px w-12 bg-[#FF6B35]/20 mb-6 group-hover:w-full transition-all duration-500"></div>
              <h3 className="text-xl font-bold uppercase mb-4 tracking-wider text-[#2D2D2D]">Instant AR</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                No apps, no waiting. Just point your phone at the menu and see our Shawarmas come to life right on your plate.
              </p>
            </div>
            <div className="group">
              <div className="text-[#FF6B35] mb-6 font-mono font-black text-5xl opacity-20 group-hover:opacity-100 transition-opacity">02</div>
              <div className="h-px w-12 bg-[#FF6B35]/20 mb-6 group-hover:w-full transition-all duration-500"></div>
              <h3 className="text-xl font-bold uppercase mb-4 tracking-wider text-[#2D2D2D]">True Volume</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Wondering how big that Shawarma is? Our 1:1 scale models show you exactly the size you'll be getting.
              </p>
            </div>
            <div className="group">
              <div className="text-[#FF6B35] mb-6 font-mono font-black text-5xl opacity-20 group-hover:opacity-100 transition-opacity">03</div>
              <div className="h-px w-12 bg-[#FF6B35]/20 mb-6 group-hover:w-full transition-all duration-500"></div>
              <h3 className="text-xl font-bold uppercase mb-4 tracking-wider text-[#2D2D2D]">Ingredient Discovery</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">
                Check ingredients and allergens by simply tapping the 3D model. Transparency has never looked so good.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
