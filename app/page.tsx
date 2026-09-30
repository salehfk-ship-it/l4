export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-right mb-4">متجر فولتكس</h1>
        <p className="text-right text-gray-600 mb-8">
          مرحباً بك في متجرنا الإلكتروني
        </p>
        
        <div className="grid gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold text-right mb-4">جاري التحميل...</h2>
            <p className="text-right text-gray-600">
              يرجى الانتظار بينما نحضر المنتجات
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}