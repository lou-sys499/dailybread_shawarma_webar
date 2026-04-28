import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Dish } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, ExternalLink } from 'lucide-react';

export default function DishList() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dishesRef = collection(db, 'dishes');
    const unsub = onSnapshot(dishesRef, 
      (snapshot) => {
        const dishesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Dish));
        setDishes(dishesList);
        setLoading(false);
      },
      (error) => {
        setLoading(false);
        handleFirestoreError(error, OperationType.LIST, 'dishes');
      }
    );
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this dish? This will permanently remove the 3D entry.')) {
      try {
        await deleteDoc(doc(db, 'dishes', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `dishes/${id}`);
      }
    }
  };

  if (loading) return <div className="p-12 text-center font-sans font-bold text-[#FF6B35] animate-pulse uppercase tracking-widest">Checking the Grill...</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-8 lg:mb-12">
        <div className="text-center sm:text-left">
            <h1 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter mb-2 text-[#2D2D2D]">Shawarma <span className="text-[#FF6B35]">Vault</span></h1>
            <p className="text-[10px] lg:text-[11px] text-gray-400 font-bold uppercase tracking-widest">Active Kitchen Menu — {dishes.length} Items Prepped</p>
        </div>
        <Link 
            to="/admin/dishes/new" 
            className="btn-primary !px-6 !py-4 flex items-center justify-center gap-3 w-full sm:w-auto"
        >
            <Plus className="w-5 h-5" />
            ADD NEW SHAWARMA
        </Link>
      </div>

      <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-100 overflow-hidden shadow-xl shadow-black/5">
        <div className="hidden lg:grid lg:grid-cols-[100px_1.5fr_1fr_1fr_120px] px-8 py-5 border-b border-gray-50 bg-gray-50/50">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Preview</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Shawarma Info</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Pricing</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Ordering Status</span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest text-right">Options</span>
        </div>

        <div className="divide-y divide-gray-50">
            {dishes.length === 0 ? (
                <div className="py-24 text-center opacity-20 font-bold uppercase tracking-widest text-xs">Kitchen Empty</div>
            ) : (
                dishes.map((dish) => (
                    <div key={dish.id} className="flex flex-col lg:grid lg:grid-cols-[100px_1.5fr_1fr_1fr_120px] px-6 lg:px-8 py-6 lg:py-6 items-start lg:items-center hover:bg-gray-50 transition-colors group gap-4 lg:gap-0">
                        <div className="w-full lg:w-16 h-40 lg:h-16 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100">
                            <img 
                                src={dish.imageUrl || `https://drive.google.com/thumbnail?id=10dOGyx0HEXb5rBoVpbqDaCthB1yE-iPu&sz=w200`} 
                                alt="" 
                                className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500"
                                referrerPolicy="no-referrer"
                            />
                        </div>

                        <div className="w-full">
                            <p className="font-black uppercase tracking-tight text-xl lg:text-xl text-[#2D2D2D]">{dish.name}</p>
                            <p className="text-[10px] lg:text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest truncate max-w-full">
                                {dish.portionSize || 'Regular Portion'}
                            </p>
                        </div>

                        <div className="flex lg:block items-baseline gap-2">
                            <p className="font-black text-2xl text-[#FF6B35]">${dish.price}</p>
                            <p className="text-[10px] lg:text-[10px] font-bold text-gray-300 uppercase tracking-widest">{dish.calories || 0} KCAL</p>
                        </div>

                        <div className="w-full lg:w-auto">
                            <div className="flex items-center gap-2">
                                <div className={`w-2.5 h-2.5 rounded-full ${dish.isAvailable ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-400'}`}></div>
                                <span className={`text-[10px] font-black uppercase tracking-widest ${dish.isAvailable ? 'text-green-600' : 'text-red-400'}`}>
                                    {dish.isAvailable ? 'ACTIVE' : 'STALLED'}
                                </span>
                            </div>
                            {dish.isSeasonal && <p className="text-[10px] font-bold text-[#FF6B35] uppercase mt-1">Limited Special</p>}
                        </div>

                        <div className="flex items-center justify-start lg:justify-end gap-2 lg:opacity-0 group-hover:opacity-100 transition-opacity w-full lg:w-auto pt-4 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                            <Link to={`/admin/dishes/edit/${dish.id}`} className="p-3 bg-gray-100/50 hover:bg-[#FF6B35] hover:text-white rounded-xl transition-all text-gray-400" title="Edit">
                                <Edit2 className="w-4 h-4" />
                            </Link>
                            <Link to={`/ar/${dish.id}`} className="p-3 bg-gray-100/50 hover:bg-[#FF6B35] hover:text-white rounded-xl transition-all text-gray-400" title="Orbit Preview">
                                <Eye className="w-4 h-4" />
                            </Link>
                            <a 
                                href={`/ar.html?model=${dish.modelUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="p-3 bg-gray-100/50 hover:bg-[#FF6B35] hover:text-white rounded-xl transition-all text-gray-400"
                                title="Marker AR Mode"
                            >
                                <ExternalLink className="w-4 h-4" />
                            </a>
                            <button 
                                onClick={() => handleDelete(dish.id)}
                                className="p-3 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-400"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )
            ))}
        </div>
      </div>
    </div>
  );
}
