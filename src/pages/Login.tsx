import { Navigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { loginWithGoogle } from '../lib/firebase';
import { LogIn } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginProps {
  user: UserProfile | null;
}

export default function Login({ user }: LoginProps) {
  if (user) return <Navigate to="/" />;

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center p-6 relative overflow-hidden bg-[#FFFDF5]">
      <div className="camera-simulation absolute inset-0 opacity-10 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-panel p-12 rounded-[3.5rem] relative z-10 border-0 shadow-2xl shadow-[#FF6B35]/5"
      >
        <div className="text-center mb-10">
          <div className="text-[10px] font-bold text-[#FF6B35] uppercase tracking-[0.4em] mb-4">DailyBread Rewards</div>
          <h2 className="text-5xl font-sans font-black tracking-tighter mb-4 text-[#2D2D2D]">
            Welcome <span className="text-[#FF6B35] italic leading-none block">Back!</span>
          </h2>
          <p className="text-[11px] text-gray-400 font-medium tracking-[0.1em] uppercase">Sign in to manage your menu</p>
        </div>

        <button
          onClick={loginWithGoogle}
          className="w-full btn-primary !py-5 flex items-center justify-center gap-4 !text-xs !tracking-[0.2em] shadow-xl"
        >
          <LogIn className="w-5 h-5 text-white" />
          SIGN IN WITH GOOGLE
        </button>
        
        <p className="mt-8 text-center text-[10px] text-gray-400 leading-relaxed font-medium uppercase tracking-widest max-w-[200px] mx-auto">
          Freshness is just one click away.
        </p>
      </motion.div>
    </div>
  );
}
