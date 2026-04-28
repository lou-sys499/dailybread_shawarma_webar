import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Dish, Category } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Info, Sandwich, ShoppingBag, Scan } from 'lucide-react';

export default function MenuPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dishesRef = collection(db, 'dishes');
    const categoriesRef = collection(db, 'categories');

    const unsubDishes = onSnapshot(dishesRef, 
      (snapshot) => {
        const dishesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dish));
        setDishes(dishesList);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.GET, 'dishes');
      }
    );

    const unsubCategories = onSnapshot(categoriesRef, 
      (snapshot) => {
        const categoriesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
        setCategories(categoriesList.sort((a, b) => (a.order || 0) - (b.order || 0)));
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'categories');
      }
    );

    return () => {
      unsubDishes();
      unsubCategories();
    };
  }, []);

  const filteredDishes = selectedCategory 
    ? dishes.filter(d => d.categoryId === selectedCategory)
    : dishes;

  if (loading) {
    return (
      <div className="p-12 text-center font-sans font-bold text-[#FF6B35] animate-pulse">
        Preheating the Shawarma Station...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-12 lg:mb-16">
        <div className="text-center lg:text-left">
          <div className="text-[#FF6B35] font-mono text-[10px] md:text-[11px] uppercase tracking-[0.4em] mb-4 font-bold">The Shawarma Collection</div>
          <h1 className="text-5xl md:text-7xl font-sans font-black uppercase tracking-tighter mb-4 leading-none text-[#2D2D2D]">Full <span className="text-[#FF6B35] italic">Flavor</span></h1>
          <p className="max-w-md mx-auto lg:mx-0 text-gray-400 text-sm md:text-base font-medium">Traditional recipes meet future tech. Discover our range of freshly prepared Shawarmas and wraps.</p>
        </div>
        
        <div className="flex flex-wrap justify-center lg:justify-start gap-2">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2 rounded-2xl text-[11px] font-bold tracking-widest transition-all ${!selectedCategory ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20' : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-600 uppercase'}`}
          >
            ALL ITEMS
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2 rounded-2xl text-[11px] font-bold tracking-widest transition-all ${selectedCategory === cat.id ? 'bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/20' : 'bg-white text-gray-400 border border-gray-100 hover:text-gray-600 uppercase'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {filteredDishes.length === 0 ? (
        <div className="py-20 text-center bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="font-mono uppercase tracking-widest text-xs text-gray-400">Kitchen Closed: No items found here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredDishes.map((dish, i) => (
            <motion.div 
              key={dish.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2rem] overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 shadow-xl shadow-black/5"
            >
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                <img 
                  src={dish.imageUrl || `https://drive.google.com/thumbnail?id=10dOGyx0HEXb5rBoVpbqDaCthB1yE-iPu&sz=w600`} 
                  alt={dish.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {dish.isSeasonal && (
                    <span className="bg-[#FF6B35] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Limited Run</span>
                  )}
                  {!dish.isAvailable && (
                    <span className="bg-gray-400 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Baking...</span>
                  )}
                </div>
                <Link 
                  to={`/ar/${dish.id}`}
                  className="absolute inset-0 bg-[#FF6B35]/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]"
                >
                  <div className="bg-[#FF6B35] p-5 rounded-3xl shadow-2xl scale-75 hover:scale-100 transition-transform">
                    <Scan className="w-8 h-8 text-white" />
                  </div>
                </Link>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold uppercase tracking-tight leading-none text-[#2D2D2D]">{dish.name}</h3>
                  <p className="font-mono text-xl font-bold text-[#FF6B35]">${dish.price}</p>
                </div>
                <p className="text-sm text-gray-400 mb-8 flex-1 leading-relaxed font-medium">{dish.description}</p>
                
                <div className="flex gap-4">
                  <Link 
                    to={`/ar/${dish.id}`}
                    className="flex-1 btn-primary !py-3 !text-xs !tracking-widest flex items-center justify-center gap-2"
                  >
                    <Sandwich className="w-4 h-4" />
                    AR VIEW
                  </Link>
                  <button className="p-3 bg-gray-50 rounded-[1rem] hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#FF6B35]">
                    <ShoppingBag className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
