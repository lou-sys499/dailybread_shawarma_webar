import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Category } from '../../types';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), 
      (snapshot) => {
        setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)).sort((a,b) => (a.order || 0) - (b.order || 0)));
        setLoading(false);
      },
      (error) => handleFirestoreError(error, OperationType.LIST, 'categories')
    );
    return unsub;
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), { name: newCatName, order: categories.length });
      setNewCatName('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'categories');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete category? Dishes in this category may become orphans.')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
      }
    }
  };

  if (loading) return <div className="p-12 text-center font-sans font-bold text-[#FF6B35] animate-pulse uppercase tracking-widest">Grouping the Menu...</div>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-12 text-[#2D2D2D]">Menu <span className="text-[#FF6B35]">Sections</span></h1>

      <form onSubmit={handleAdd} className="flex gap-4 mb-12">
        <input 
            type="text" 
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="ADD NEW CATEGORY..."
            className="flex-1 bg-white border border-gray-100 rounded-2xl px-6 py-4 font-bold focus:outline-none focus:border-[#FF6B35] shadow-sm"
        />
        <button type="submit" className="bg-[#2D2D2D] text-white px-8 py-4 rounded-2xl font-black hover:bg-[#FF6B35] transition-colors uppercase tracking-widest text-[11px]">
            ADD
        </button>
      </form>

      <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-xl shadow-black/5">
        {categories.length === 0 ? (
            <div className="p-12 text-center opacity-20 font-bold uppercase tracking-widest text-xs">No sections defined</div>
        ) : (
            <div className="divide-y divide-gray-50">
                {categories.map((cat, i) => (
                    <div key={cat.id} className="flex items-center justify-between p-8 hover:bg-orange-50/30 group transition-colors">
                        <div className="flex items-center gap-6">
                            <span className="font-mono text-xs text-[#FF6B35] font-black">{String(i + 1).padStart(2, '0')}</span>
                            <p className="font-black uppercase tracking-widest text-[#2D2D2D]">{cat.name}</p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleDelete(cat.id)} className="p-3 bg-red-50 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
