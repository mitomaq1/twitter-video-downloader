# 🚀 Backend Hızlı Deploy Rehberi

Backend olmadan uygulama çalışmaz! Backend'i deploy etmeniz gerekiyor.

## ⚡ En Hızlı Çözüm: Railway (Önerilen)

### Adım 1: Railway'e Giriş
1. https://railway.app adresine gidin
2. "Start a New Project" tıklayın
3. GitHub hesabınızla giriş yapın

### Adım 2: Repository'yi Bağla
1. "Deploy from GitHub repo" seçin
2. `twitter-video-downloader` repository'sini seçin
3. "Deploy Now" tıklayın

### Adım 3: Ayarları Yapılandır
1. Railway dashboard'da projenizi açın
2. Settings → Root Directory → `backend` yazın
3. Settings → Start Command → `npm start` yazın

### Adım 4: Environment Variables Ekle
Settings → Variables sekmesinde ekleyin:

```
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-netlify-site.netlify.app
```

**ÖNEMLİ:** `CORS_ORIGIN` değerini Netlify site URL'inizle değiştirin!

### Adım 5: Domain'i Kopyala
Railway size bir URL verecek (örn: `https://your-app.railway.app`)
Bu URL'i kopyalayın.

### Adım 6: Frontend'de API URL'ini Güncelle

**Netlify Dashboard'da:**
1. Site Settings → Environment variables
2. Yeni variable ekleyin:
   ```
   VITE_API_URL = https://your-app.railway.app/api
   ```
3. "Redeploy site" yapın

## 🔄 Alternatif: Render

1. https://render.com adresine gidin
2. "New Web Service" seçin
3. GitHub repository'yi bağlayın
4. Ayarlar:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`
5. Environment variables ekleyin (Railway ile aynı)

## 🔄 Alternatif: Heroku

1. https://heroku.com adresine gidin
2. Yeni app oluşturun
3. GitHub'ı bağlayın
4. Settings → Config Vars ekleyin
5. Deploy → Manual deploy → Deploy branch

## ✅ Deploy Sonrası Kontrol

Backend deploy edildikten sonra:

1. Backend URL'inizi test edin:
   ```
   https://your-backend-url.com/health
   ```
   Şu cevabı almalısınız: `{"status":"ok","message":"Server is running"}`

2. Frontend'deki API URL'ini güncelleyin (Netlify environment variables)

3. Netlify'de site'i redeploy edin

4. Test edin!

## 🐛 Sorun Giderme

### "Backend server is not available" hatası
- Backend'in deploy edildiğinden emin olun
- Backend URL'inin doğru olduğunu kontrol edin
- CORS_ORIGIN'in Netlify URL'inizle eşleştiğini kontrol edin

### CORS hatası
- Backend'deki `CORS_ORIGIN` environment variable'ını Netlify URL'inizle güncelleyin
- Backend'i restart edin

### 404 hatası
- Backend URL'inin sonunda `/api` olduğundan emin olun
- Örnek: `https://your-app.railway.app/api`

## 📝 Hızlı Checklist

- [ ] Backend deploy edildi (Railway/Render/Heroku)
- [ ] Backend URL'i çalışıyor (`/health` endpoint test edildi)
- [ ] CORS_ORIGIN Netlify URL'i ile eşleşiyor
- [ ] Frontend'de VITE_API_URL environment variable eklendi
- [ ] Netlify'de site redeploy edildi
- [ ] Test edildi - çalışıyor! ✅

