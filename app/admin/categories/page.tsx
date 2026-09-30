'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: number;
  name: string;
  description?: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await supabase.from('categories').select('*');
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('categories').insert([{ name, description }]);
      if (error) throw error;
      setName('');
      setDescription('');
      setShowForm(false);
      loadCategories();
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">التصنيفات</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + إضافة تصنيف
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-lg shadow mb-8 max-w-lg">
          <div className="mb-4">
            <label className="block text-right mb-2">الاسم</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded text-right"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            إضافة
          </button>
        </form>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-right">الاسم</th>
              <th className="px-6 py-3 text-right">الوصف</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id} className="border-t">
                <td className="px-6 py-4">{category.name}</td>
                <td className="px-6 py-4">{category.description || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}