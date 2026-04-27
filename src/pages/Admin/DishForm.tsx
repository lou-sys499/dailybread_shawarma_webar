import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Dish, Category } from '../../types';
import { ArrowLeft, Save, Plus, X, Box } from 'lucide-react';

const SAMPLE_MODELS = [
    { name: 'Khronos Duck', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb' },
    { name: 'Khronos Avocado', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb' },
    { name: 'Khronos Damaged Helmet (Cool Asset)', url: 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/DamagedHelmet/glTF-Binary/DamagedHelmet.glb' },
];

export default function DishForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Dish>>({
    name: '',
    description: '',
    price: 0,
    calories: 0,
    ingredients: [],
    allergens: [],
    modelUrl: '',
    imageUrl: '',
    categoryId: '',
    isSeasonal: false,
    isAvailable: true,
    portionSize: 'Standard 12" Plate Scale'
  });

  const [ingredientInput, setIngredientInput] = useState('');
  const [allergenInput, setAllergenInput] = useState('');

  useEffect(() => {
    // Fetch categories for dropdown
    const fetchCategories = async () => {
      const catRef = collection(db, 'categories');
      // Using simple getDocs for simplicity in form
      const getDocs = await import('firebase/firestore').then(f => f.getDocs);
      const snap = await getDocs(catRef);
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    };
    fetchCategories();

    if (id) {
      const fetchDish = async () => {
        const docRef = doc(db, 'dishes', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setFormData(snap.data() as Dish);
        }
      };
      fetchDish();
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        await updateDoc(doc(db, 'dishes', id), formData);
      } else {
        await addDoc(collection(db, 'dishes'), formData);
      }
      navigate('/admin/dishes');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'dishes');
    } finally {
      setLoading(false);
    }
  };

  const addTag = (type: 'ingredients' | 'allergens', value: string) => {
    if (!value.trim()) return;
    const currentList = formData[type] || [];
    if (!currentList.includes(value.trim())) {
      setFormData({ ...formData, [type]: [...currentList, value.trim()] });
    }
    if (type === 'ingredients') setIngredientInput('');
    else setAllergenInput('');
  };

  const removeTag = (type: 'ingredients' | 'allergens', value: string) => {
    const currentList = formData[type] || [];
    setFormData({ ...formData, [type]: currentList.filter(v => v !== value) });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/admin/dishes')}
        className="flex items-center gap-2 text-[10px] font-bold opacity-40 hover:opacity-100 uppercase tracking-[0.2em] mb-6 md:mb-8"
      >
        <ArrowLeft className="w-3 h-3" />
        Cancel Entry
      </button>

      <div className="flex justify-between items-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter">
            {id ? 'Modify Dish' : 'New Dish Asset'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12 pb-24">
        {/* Basic Info Section */}
        <section className="glass-panel p-6 md:p-10 rounded-3xl border-white/5">
            <h3 className="text-xs font-mono font-bold text-[#FF6B35] uppercase tracking-widest mb-6 md:mb-8 pb-4 border-b border-gray-100">Identity & Metadata</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Dish Name</label>
                    <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] font-bold text-[#2D2D2D] placeholder:opacity-20"
                        placeholder="e.g. Signature Lamb Shawarma"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Category</label>
                    <select 
                        required
                        value={formData.categoryId}
                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] font-bold appearance-none text-[#2D2D2D]"
                    >
                        <option value="" className="bg-white text-[#2D2D2D]">SELECT CATEGORY</option>
                        {categories.map(c => <option key={c.id} value={c.id} className="bg-white text-[#2D2D2D]">{c.name.toUpperCase()}</option>)}
                    </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Description</label>
                    <textarea 
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] h-32 resize-none text-[#2D2D2D] font-light placeholder:opacity-20"
                        placeholder="Detail the dish flavors, prep method, and story..."
                    />
                </div>
            </div>
        </section>

        {/* Assets Section */}
        <section className="glass-panel p-6 md:p-10 rounded-3xl border-white/5">
            <h3 className="text-xs font-mono font-bold text-[#FF6B35] uppercase tracking-widest mb-6 md:mb-8 pb-4 border-b border-gray-100">3D Assets & Media</h3>
            
            <div className="space-y-6 md:space-y-8">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">GLB/GLTF Model URL</label>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input 
                            required
                            type="url" 
                            value={formData.modelUrl}
                            onChange={(e) => setFormData({ ...formData, modelUrl: e.target.value })}
                            className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] font-mono text-xs text-[#2D2D2D] placeholder:opacity-20"
                            placeholder="https://..."
                        />
                        <div className="relative group self-end sm:self-auto">
                            <button type="button" className="bg-[#FF6B35] text-white p-3 rounded-xl hover:scale-105 transition-transform">
                                <Box className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-full mb-2 sm:top-full sm:mt-2 right-0 w-64 glass-panel border border-gray-100 rounded-xl shadow-2xl p-4 hidden group-hover:block z-50">
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#FF6B35] mb-3 opacity-60">Quick Sample Assets</p>
                                <div className="space-y-1">
                                    {SAMPLE_MODELS.map(m => (
                                        <button 
                                            key={m.name} 
                                            type="button"
                                            onClick={() => setFormData({ ...formData, modelUrl: m.url })}
                                            className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-[10px] uppercase font-bold tracking-widest text-gray-400 hover:text-[#FF6B35]"
                                        >
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Cover Image URL</label>
                    <input 
                        type="url" 
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] font-mono text-xs text-[#2D2D2D] placeholder:opacity-20"
                        placeholder="https://drive.google.com/..."
                    />
                </div>
                
                <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Portion Scale Text</label>
                    <input 
                        type="text" 
                        value={formData.portionSize}
                        onChange={(e) => setFormData({ ...formData, portionSize: e.target.value })}
                        className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] text-[#2D2D2D] placeholder:opacity-20"
                        placeholder='e.g. Standard 12" Plate Scale'
                    />
                </div>
            </div>
        </section>

        {/* Specs Section */}
        <section className="glass-panel p-6 md:p-10 rounded-3xl border-white/5">
            <h3 className="text-xs font-mono font-bold text-[#FF6B35] uppercase tracking-widest mb-6 md:mb-8 pb-4 border-b border-gray-100">Specifications & Availability</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                <div className="space-y-6 md:space-y-8">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Price ($)</label>
                            <input 
                                required
                                type="number" 
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] font-black text-2xl text-[#2D2D2D] underline underline-offset-4 decoration-[#FF6B35]"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Calories</label>
                            <input 
                                type="number" 
                                value={formData.calories}
                                onChange={(e) => setFormData({ ...formData, calories: parseInt(e.target.value) })}
                                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3 focus:outline-none focus:border-[#FF6B35] font-black text-2xl text-gray-300"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <label className="flex items-center gap-4 cursor-pointer group">
                             <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isAvailable ? 'bg-green-500' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isAvailable ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </div>
                             <input 
                                type="checkbox" 
                                className="hidden"
                                checked={formData.isAvailable}
                                onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                             />
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D2D2D]">Registry Active</span>
                        </label>
                        <label className="flex items-center gap-4 cursor-pointer group">
                             <div className={`w-12 h-6 rounded-full p-1 transition-colors ${formData.isSeasonal ? 'bg-[#FF6B35]' : 'bg-gray-200'}`}>
                                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${formData.isSeasonal ? 'translate-x-6' : 'translate-x-0'}`}></div>
                             </div>
                             <input 
                                type="checkbox" 
                                className="hidden"
                                checked={formData.isSeasonal}
                                onChange={(e) => setFormData({ ...formData, isSeasonal: e.target.checked })}
                             />
                             <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#2D2D2D]">Seasonal Priority</span>
                        </label>
                    </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Ingredients</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                value={ingredientInput}
                                onChange={(e) => setIngredientInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('ingredients', ingredientInput))}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-[#2D2D2D]"
                                placeholder="Add ingredient..."
                            />
                            <button type="button" onClick={() => addTag('ingredients', ingredientInput)} className="bg-[#FF6B35] text-white p-2 rounded-lg">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.ingredients?.map(ing => (
                                <span key={ing} className="bg-gray-50 border border-gray-100 px-3 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-2 text-[#FF6B35]">
                                    {ing}
                                    <button type="button" onClick={() => removeTag('ingredients', ing)} className="hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#FF6B35] opacity-60">Allergens</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                value={allergenInput}
                                onChange={(e) => setAllergenInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag('allergens', allergenInput))}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs text-[#2D2D2D]"
                                placeholder="Add allergen..."
                            />
                            <button type="button" onClick={() => addTag('allergens', allergenInput)} className="bg-gray-100 text-gray-400 p-2 rounded-lg">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.allergens?.map(all => (
                                <span key={all} className="bg-red-50 border border-red-100 text-red-500 px-3 py-1 rounded-lg text-[9px] font-bold uppercase flex items-center gap-2">
                                    {all}
                                    <button type="button" onClick={() => removeTag('allergens', all)} className="hover:text-red-300">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <div className="flex justify-end pt-8">
            <button 
                type="submit"
                disabled={loading}
                className="btn-primary w-full sm:w-auto !py-5 !px-16 !text-xs !tracking-[0.3em] flex items-center justify-center gap-4 hover:scale-[1.05] transition-transform disabled:opacity-50"
            >
                {loading ? 'PREPARING...' : (
                    <>
                        <Save className="w-5 h-5 text-white" />
                        {id ? 'UPDATE ASSET' : 'CREATE ASSET'}
                    </>
                )}
            </button>
        </div>
      </form>
    </div>
  );
}
