'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: admin } = await supabase
        .from('admins')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (admin) {
        setIsAdmin(true);
        setLoading(false);
      } else {
        router.push('/');
      }
    } catch (error) {
      router.push('/');
    }
  };

  if (loading) {
    return <div className="p-4">جاري التحميل...</div>;
  }

  if (!isAdmin) {
    return <div className="p-4">غير مصرح</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">لوحة التحكم</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-800">
            الرئيسية
          </Link>
          <Link href="/admin/products" className="block px-4 py-2 rounded hover:bg-gray-800">
            المنتجات
          </Link>
          <Link href="/admin/categories" className="block px-4 py-2 rounded hover:bg-gray-800">
            التصنيفات
          </Link>
          <Link href="/admin/cities" className="block px-4 py-2 rounded hover:bg-gray-800">
            المدن والتوصيل
          </Link>
          <Link href="/admin/orders" className="block px-4 py-2 rounded hover:bg-gray-800">
            الطلبات
          </Link>
          <Link href="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-800">
            الإعدادات
          </Link>
          <button
            onClick={() => {
              supabase.auth.signOut();
              router.push('/');
            }}
            className="w-full text-right px-4 py-2 rounded hover:bg-red-700"
          >
            تسجيل الخروج
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}