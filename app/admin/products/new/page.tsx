'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    discount_price: '',
    stock: '0',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('products').insert([
        {
          code: formData.code,
          name: formData.name,
          description: formData.description || null,
          price: parseFloat(formData.price),
          discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
          stock: parseInt(formData.stock),
        },
      ]);

      if (error) throw error;
      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">إضافة منتج جديد</h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow max-w-lg">
        <div className="mb-4">
          <label className="block text-right mb-2">الكود (فريد)</label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right mb-2">الاسم</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right mb-2">السعر</label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <div className="mb-4">
          <label className="block text-right mb-2">سعر التخفيض (اختياري)</label>
          <input
            type="number"
            step="0.01"
            value={formData.discount_price}
            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <div className="mb-6">
          <label className="block text-right mb-2">المخزون</label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            className="w-full px-4 py-2 border rounded text-right"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
        </button>
      </form>
    </div>
  );
}