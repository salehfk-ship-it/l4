'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  discount_price?: number;
  image_url?: string;
  stock: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">المنتجات</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          + إضافة منتج
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-right">الكود</th>
              <th className="px-6 py-3 text-right">الاسم</th>
              <th className="px-6 py-3 text-right">السعر</th>
              <th className="px-6 py-3 text-right">المخزون</th>
              <th className="px-6 py-3 text-right">الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{product.code}</td>
                <td className="px-6 py-4">{product.name}</td>
                <td className="px-6 py-4">{product.price} د.ل</td>
                <td className="px-6 py-4">{product.stock}</td>
                <td className="px-6 py-4">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-blue-600 hover:underline ml-4"
                  >
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}