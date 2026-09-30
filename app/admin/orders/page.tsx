'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">الطلبات</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-right">رقم الطلب</th>
              <th className="px-6 py-3 text-right">اسم العميل</th>
              <th className="px-6 py-3 text-right">الهاتف</th>
              <th className="px-6 py-3 text-right">المبلغ</th>
              <th className="px-6 py-3 text-right">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4">{order.order_number}</td>
                <td className="px-6 py-4">{order.customer_name}</td>
                <td className="px-6 py-4">{order.customer_phone}</td>
                <td className="px-6 py-4">{order.total_amount} د.ل</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded text-white ${
                    order.status === 'pending' ? 'bg-yellow-600' :
                    order.status === 'completed' ? 'bg-green-600' :
                    'bg-red-600'
                  }`}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}