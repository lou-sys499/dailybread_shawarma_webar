import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { auth } from '../lib/firebase';
import { LogIn, LogOut, LayoutDashboard, Utensils, Scan, Sandwich, Menu, X } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    setIsMenuOpen(false);
    navigate('/');
  };

  const NavLinks = () => (
    <>
      <Link 
        to="/menu" 
        onClick={() => setIsMenuOpen(false)}
        className="text-[11px] font-bold tracking-widest text-gray-500 hover:text-[#FF6B35] transition-colors flex items-center gap-2 uppercase md:text-[10px] lg:text-[11px]"
      >
        <Sandwich className="w-4 h-4" />
        Shawarma Menu
      </Link>
      <Link 
        to="/ar/scan" 
        onClick={() => setIsMenuOpen(false)}
        className="text-[11px] font-bold tracking-widest text-gray-500 hover:text-[#FF6B35] transition-colors flex items-center gap-2 uppercase md:text-[10px] lg:text-[11px]"
      >
        <Scan className="w-4 h-4" />
        AR Scan
      </Link>
      {user?.isAdmin && (
        <Link 
          to="/admin" 
          onClick={() => setIsMenuOpen(false)}
          className="text-[11px] font-bold tracking-widest text-gray-500 hover:text-[#FF6B35] transition-colors flex items-center gap-2 uppercase md:text-[10px] lg:text-[11px]"
        >
          <LayoutDashboard className="w-4 h-4" />
          Admin
        </Link>
      )}
      {user ? (
        <button 
          onClick={handleLogout}
          className="text-[11px] font-bold tracking-widest text-red-400 hover:text-red-600 flex items-center gap-2 uppercase transition-colors md:text-[10px] lg:text-[11px]"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      ) : (
        <Link 
          to="/login" 
          onClick={() => setIsMenuOpen(false)}
          className="text-[11px] font-bold tracking-widest text-gray-500 hover:text-[#FF6B35] transition-colors flex items-center gap-2 uppercase md:text-[10px] lg:text-[11px]"
        >
          <LogIn className="w-4 h-4" />
          Login
        </Link>
      )}
    </>
  );

  return (
    <nav className="relative z-50 mx-4 mt-4">
      <div className="glass-panel px-6 py-4 md:px-8 md:py-5 flex items-center justify-between rounded-3xl">
        <Link to="/" className="flex items-center gap-2 md:gap-3" onClick={() => setIsMenuOpen(false)}>
          <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FF6B35] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF6B35]/20">
            <Utensils className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="font-sans font-black tracking-tighter text-xl md:text-2xl text-[#2D2D2D]">Daily<span className="text-[#FF6B35]">Bread</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <NavLinks />
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-gray-500 hover:text-[#FF6B35] transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 md:hidden">
          <div className="glass-panel p-6 rounded-3xl flex flex-col gap-6 shadow-2xl">
            <NavLinks />
          </div>
        </div>
      )}
    </nav>
  );
}
