'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    categories: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [products, orders, categories] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('categories').select('id', { count: 'exact' }),
      ]);

      setStats({
        products: products.count || 0,
        orders: orders.count || 0,
        categories: categories.count || 0,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">لوحة التحكم الرئيسية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">المنتجات</h3>
          <p className="text-4xl font-bold text-blue-600">{stats.products}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">الطلبات</h3>
          <p className="text-4xl font-bold text-green-600">{stats.orders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-600 mb-2">التصنيفات</h3>
          <p className="text-4xl font-bold text-purple-600">{stats.categories}</p>
        </div>
      </div>
    </div>
  );
}