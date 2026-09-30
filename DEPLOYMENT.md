# نشر متجر فولتكس

## نشر على Vercel (الطريقة الموصى بها)

### الخطوة 1: إعدادات GitHub
1. ادفع المشروع إلى GitHub
2. تأكد من أن `main` هو الفرع الافتراضي

### الخطوة 2: إعدادات Vercel
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط "New Project"
3. اختر المستودع `voltex-store`
4. اترك الإعدادات الافتراضية
5. أضف متغيرات البيئة:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
6. اضغط Deploy

### الخطوة 3: إعدادات Supabase
1. اذهب إلى Supabase Console
2. ادخل إلى Project Settings → API
3. أضف رابط Vercel إلى CORS:
   ```
   https://your-domain.vercel.app
   ```

### الخطوة 4: مجال مخصص (اختياري)
1. في Vercel → Project Settings → Domains
2. أضف مجالك الخاص
3. حدّث DNS records

## نشر يدوي على خادم

### المتطلبات:
- Node.js 18+
- PM2 لتشغيل العمليات
- Nginx كـ reverse proxy

### الخطوات:

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/voltex-store.git
cd voltex-store

# 2. التثبيت
npm install

# 3. الإعدادات
cp .env.local.example .env.local
# عدّل .env.local بـ بيانات Supabase

# 4. البناء
npm run build

# 5. البدء مع PM2
npm install -g pm2
pm2 start npm --name "voltex" -- start
pm2 save
```

### إعدادات Nginx:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## نشر على Docker

### Dockerfile:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### Build و Run:
```bash
docker build -t voltex-store .
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  voltex-store
```

## نصائح الإنتاج

### الأمان:
- [ ] فعّل HTTPS
- [ ] عطّل الوضع التطوير
- [ ] استخدم متغيرات البيئة الآمنة
- [ ] قيّد CORS
- [ ] فعّل CSP headers

### الأداء:
- [ ] فعّل Caching
- [ ] استخدم CDN للصور
- [ ] قيّس أداء الصفحات
- [ ] حسّن قواعد البيانات

### المراقبة:
- [ ] سجّل الأخطاء (Sentry)
- [ ] راقب الأداء (New Relic)
- [ ] راقب التوفر (Uptime Robot)

## النسخ الاحتياطية

### Supabase Backups:
1. اذهب إلى Settings → Backups
2. فعّل الحفظ الآلي
3. تحقق من النسخ الاحتياطية بانتظام

### الملفات:
```bash
# نسخ احتياطية يومية
cron: 0 2 * * * tar -czf /backups/voltex-$(date +%Y%m%d).tar.gz /app
```

## استكشاف الأخطاء

### المشاكل الشائعة:

**Supabase connection error:**
- تحقق من المتغيرات البيئية
- تأكد من أن المفاتيح صحيحة
- تحقق من CORS settings

**Build fails:**
```bash
rm -rf node_modules .next
npm install
npm run build
```

**Database errors:**
- تحقق من RLS policies
- تأكد من الجداول موجودة
- تحقق من الأذونات

---

*آخر تحديث: 2026-09-30*
