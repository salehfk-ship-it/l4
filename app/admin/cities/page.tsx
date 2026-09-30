'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface City {
  id: number;
  name: string;
  delivery_fee: number;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', delivery_fee: '' });

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const { data } = await supabase.from('cities').select('*');
      setCities(data || []);
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('cities').insert([{
        name: formData.name,
        delivery_fee: parseFloat(formData.delivery_fee),
      }]);
      if (error) throw error;
      setFormData({ name: '', delivery_fee: '' });
      setShowForm(false);
      loadCities();
    } catch (error) {
      console.error('Error adding city:', error);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">المدن والتوصيل</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + إضافة مدينة
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCity} className="bg-white p-6 rounded-lg shadow mb-8 max-w-lg">
          <div className="mb-4">
            <label className="block text-right mb-2">اسم المدينة</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border rounded text-right"
            />
          </div>
          <div className="mb-4">
            <label className="block text-right mb-2">سعر التوصيل</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.delivery_fee}
              onChange={(e) => setFormData({ ...formData, delivery_fee: e.target.value })}
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
              <th className="px-6 py-3 text-right">اسم المدينة</th>
              <th className="px-6 py-3 text-right">سعر التوصيل</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((city) => (
              <tr key={city.id} className="border-t">
                <td className="px-6 py-4">{city.name}</td>
                <td className="px-6 py-4">{city.delivery_fee} د.ل</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}