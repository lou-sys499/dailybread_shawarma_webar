import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Home from './pages/Home';
import MenuPage from './pages/MenuPage';
import ARPage from './pages/ARPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import Login from './pages/Login';
import { UserProfile } from './types';
import Navbar from './components/Navbar';
import { AnimatePresence, motion } from 'motion/react';

function AnimatedRoutes({ user }: { user: UserProfile | null }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/ar/:dishId" element={<ARPage />} />
          <Route 
            path="/admin/*" 
            element={user?.isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/login" element={<Login user={user} />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
        const isAdmin = adminDoc.exists() || firebaseUser.email === 'austinlouisetx@gmail.com';
        
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || 'Guest',
          isAdmin: isAdmin
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#080808]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FFB800]"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#FFFDF5] text-[#2D2D2D] font-sans selection:bg-[#FF6B35] selection:text-white">
        <Navbar user={user} />
        <AnimatedRoutes user={user} />
      </div>
    </BrowserRouter>
  );
}
