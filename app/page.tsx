'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Product = {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  image_url: string | null;
  stock: number;
};

type CartItem = Product & { quantity: number };

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('voltex-cart');
    if (saved) setCart(JSON.parse(saved));
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem('voltex-cart', JSON.stringify(cart));
  }, [cart]);

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('id,code,name,description,price,discount_price,image_url,stock')
      .eq('active', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false });
    if (error) setError('تعذر تحميل المنتجات حالياً');
    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
          : item);
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  const count = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  return (
    <main dir="rtl" className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold">فولتكس</h1>
          <Link href="/checkout" className="rounded-lg bg-blue-600 px-4 py-2 hover:bg-blue-700">
            السلة ({count})
          </Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-6 py-12 text-center">
        <h2 className="text-4xl font-bold text-slate-900">تسوّق منتجاتنا</h2>
        <p className="mt-3 text-slate-600">منتجات مختارة، وأسعار واضحة، وتوصيل إلى مدينتك</p>
      </section>
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {error && <p className="mb-6 rounded bg-red-100 p-4 text-red-700">{error}</p>}
        {loading ? <p className="text-center">جاري تحميل المنتجات...</p> : products.length === 0 ? (
          <p className="rounded-xl bg-white p-10 text-center text-slate-600">لا توجد منتجات متاحة حالياً.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const price = product.discount_price || product.price;
              return <article key={product.id} className="overflow-hidden rounded-xl bg-white shadow">
                {product.image_url ? <img src={product.image_url} alt={product.name} className="h-56 w-full object-cover" /> : <div className="flex h-56 items-center justify-center bg-slate-100 text-slate-400">لا توجد صورة</div>}
                <div className="p-5">
                  <h3 className="text-xl font-bold">{product.name}</h3>
                  {product.description && <p className="mt-2 text-sm text-slate-600">{product.description}</p>}
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-bold text-blue-700">{price} د.ل</span>
                    <button onClick={() => addToCart(product)} className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-700">أضف للسلة</button>
                  </div>
                </div>
              </article>;
            })}
          </div>
        )}
      </section>
    </main>
  );
}
