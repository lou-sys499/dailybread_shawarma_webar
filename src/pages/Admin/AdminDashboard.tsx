import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import DishList from './DishList';
import DishForm from './DishForm';
import CategoryList from './CategoryList';
import { Utensils, Tag, BarChart3, Settings, Database, Sandwich } from 'lucide-react';

export default function AdminDashboard() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [seeding, setSeeding] = useState(false);

  const seedData = async () => {
      if (!window.confirm('Ready to populate the kitchen with fresh Shawarmas?')) return;
      setSeeding(true);
      try {
          // Add Categories
          const catRef = await addDoc(collection(db, 'categories'), { name: 'Main Shawarmas', order: 1 });
          const wrapRef = await addDoc(collection(db, 'categories'), { name: 'Wraps & Sides', order: 2 });
          
          // Add Dishes
          await addDoc(collection(db, 'dishes'), {
              name: 'Signature Lamb Shawarma',
              description: 'Our world-famous slow-grilled lamb, seasoned with DailyBread secret spices. Served on a warm base of fluffy rice.',
              price: 14,
              calories: 720,
              ingredients: ['Local Lamb', 'Sumac', 'Onion', 'Basmati Rice'],
              allergens: [],
              modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb',
              imageUrl: 'https://drive.google.com/thumbnail?id=10dOGyx0HEXb5rBoVpbqDaCthB1yE-iPu&sz=w1200',
              categoryId: catRef.id,
              isSeasonal: false,
              isAvailable: true,
              portionSize: 'Healthy Adult'
          });

          await addDoc(collection(db, 'dishes'), {
            name: 'Mediterranean Wrap',
            description: 'Tender chicken strips with fresh green salad and our signature garlic sauce, wrapped in a warm artisan flatbread.',
            price: 9,
            calories: 540,
            ingredients: ['Chicken', 'Flatbread', 'Garlic Sauce', 'Tomato'],
            allergens: ['Gluten', 'Eggs'],
            modelUrl: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
            categoryId: wrapRef.id,
            isSeasonal: true,
            isAvailable: true,
            portionSize: 'Standard'
        });

        alert('Kitchen stocked! Sample data seeded successfully.');
      } catch (e) {
          console.error(e);
          alert('Error seeding data.');
      } finally {
          setSeeding(false);
      }
  };

  const tabs = [
    { name: 'SHAWARMAS', path: '/admin', icon: Sandwich },
    { name: 'CATEGORIES', path: '/admin/categories', icon: Tag },
    { name: 'SALES', path: '/admin/analytics', icon: BarChart3 },
    { name: 'SETTINGS', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)]">
      {/* Sidebar/TopNav */}
      <aside className="w-full lg:w-64 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 p-6 lg:p-8 flex flex-col shrink-0">
        <div className="mb-6 lg:mb-12">
            <h2 className="text-[10px] font-sans font-black tracking-[0.4em] text-gray-300 uppercase mb-4 lg:mb-8 text-center lg:text-left">Management</h2>
            <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => {
                    const isActive = currentPath === tab.path || (tab.path === '/admin' && currentPath === '/admin/dishes');
                    return (
                        <Link 
                            key={tab.name}
                            to={tab.path}
                            className={`flex items-center gap-3 lg:gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-[10px] lg:text-[11px] tracking-widest whitespace-nowrap ${isActive ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20' : 'hover:bg-gray-100 text-gray-400 uppercase'}`}
                        >
                            <tab.icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            {tab.name}
                        </Link>
                    );
                })}
            </nav>
        </div>

        <div className="hidden lg:block mt-8">
            <button 
                onClick={seedData}
                disabled={seeding}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all font-bold text-[11px] hover:bg-orange-50 text-[#FF6B35] uppercase tracking-widest"
            >
                <Database className="w-4 h-4" />
                {seeding ? 'PREPARING...' : 'SEED SAMPLE SHAWARMAS'}
            </button>
        </div>

        <div className="hidden lg:block mt-auto pt-8">
            <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50">
                <p className="text-[10px] font-bold text-gray-300 uppercase mb-2">Sync Control</p>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#2D2D2D]">Cloud Ready</span>
                </div>
            </div>
        </div>
      </aside>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#FFFDF5] p-4 sm:p-6 lg:p-12 relative">
        <div className="camera-simulation absolute inset-0 opacity-10 pointer-events-none"></div>
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<DishList />} />
            <Route path="/dishes" element={<DishList />} />
            <Route path="/dishes/new" element={<DishForm />} />
            <Route path="/dishes/edit/:id" element={<DishForm />} />
            <Route path="/categories" element={<CategoryList />} />
            <Route path="/analytics" element={<div className="p-12 text-center opacity-20 font-mono">Analytics Module Loading...</div>} />
            <Route path="/settings" element={<div className="p-12 text-center opacity-20 font-mono">Settings Module Loading...</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
