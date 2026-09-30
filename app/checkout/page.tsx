'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Item = { id: number; name: string; price: number; discount_price: number | null; stock: number; quantity: number };
type City = { id: number; name: string; delivery_fee: number };

export default function CheckoutPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [cityId, setCityId] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('voltex-cart');
    if (saved) setItems(JSON.parse(saved));
    supabase.from('cities').select('id,name,delivery_fee').order('name').then(({ data }) => setCities((data as City[]) || []));
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.discount_price || item.price) * item.quantity, 0), [items]);
  const delivery = cities.find((city) => String(city.id) === cityId)?.delivery_fee || 0;
  const total = subtotal + delivery;

  function updateQuantity(id: number, quantity: number) {
    const next = items.map((item) => item.id === id ? { ...item, quantity: Math.max(0, Math.min(quantity, item.stock)) } : item).filter((item) => item.quantity > 0);
    setItems(next);
    localStorage.setItem('voltex-cart', JSON.stringify(next));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!items.length) return setMessage('السلة فارغة. أضف منتجاً أولاً.');
    if (!cityId) return setMessage('اختر مدينة التوصيل.');
    setSaving(true);
    const orderNumber = `VLT-${Date.now().toString(36).toUpperCase()}`;
    const { data: order, error } = await supabase.from('orders').insert({
      order_number: orderNumber, customer_name: form.name, customer_phone: form.phone,
      customer_email: form.email || null, city_id: Number(cityId), address: form.address,
      total_amount: total, delivery_fee: delivery, notes: form.notes || null,
    }).select('id').single();
    if (error || !order) { setMessage(error?.message || 'تعذر إنشاء الطلب.'); setSaving(false); return; }
    const { error: itemError } = await supabase.from('order_items').insert(items.map((item) => ({
      order_id: order.id, product_id: item.id, quantity: item.quantity, price: item.discount_price || item.price,
    })));
    if (itemError) { setMessage('تم إنشاء الطلب لكن تعذر حفظ التفاصيل، تواصل مع الإدارة.'); }
    else { localStorage.removeItem('voltex-cart'); setItems([]); setMessage(`تم استلام طلبك بنجاح. رقم الطلب: ${orderNumber}`); }
    setSaving(false);
  }

  return <main dir="rtl" className="min-h-screen bg-slate-50 px-6 py-10"><div className="mx-auto max-w-3xl">
    <Link href="/" className="text-blue-700">← متابعة التسوق</Link><h1 className="my-6 text-3xl font-bold">إتمام الطلب</h1>
    {message && <div className="mb-5 rounded bg-blue-100 p-4 text-blue-900">{message}</div>}
    {!items.length ? <div className="rounded-xl bg-white p-8 text-center">السلة فارغة.</div> : <>
      <div className="mb-6 rounded-xl bg-white p-6 shadow">{items.map((item) => <div key={item.id} className="flex items-center justify-between border-b py-3 last:border-0"><span>{item.name}</span><div className="flex items-center gap-3"><button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="rounded bg-slate-200 px-3">−</button><span>{item.quantity}</span><button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="rounded bg-slate-200 px-3">+</button><b>{(item.discount_price || item.price) * item.quantity} د.ل</b></div></div>)}</div>
      <form onSubmit={submit} className="rounded-xl bg-white p-6 shadow"><h2 className="mb-4 text-xl font-bold">بيانات التوصيل</h2><div className="grid gap-4 sm:grid-cols-2">
        {([['name','الاسم'],['phone','رقم الهاتف'],['email','البريد الإلكتروني'],['address','العنوان']] as const).map(([key,label]) => <input key={key} required={key !== 'email'} type={key === 'email' ? 'email' : 'text'} placeholder={label} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="rounded border p-3" />)}
        <select required value={cityId} onChange={(e) => setCityId(e.target.value)} className="rounded border p-3"><option value="">اختر المدينة</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name} - {city.delivery_fee} د.ل</option>)}</select>
        <textarea placeholder="ملاحظات (اختياري)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded border p-3" />
      </div><div className="my-5 space-y-2 border-t pt-4"><p>المجموع: {subtotal} د.ل</p><p>التوصيل: {delivery} د.ل</p><p className="text-xl font-bold">الإجمالي: {total} د.ل</p></div><button disabled={saving} className="w-full rounded bg-blue-700 py-3 text-white disabled:opacity-50">{saving ? 'جاري إرسال الطلب...' : 'تأكيد الطلب'}</button></form>
    </>}
  </div></main>;
}
