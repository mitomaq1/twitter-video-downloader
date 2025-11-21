# Netlify Deploy Talimatları

## Önemli Not
Netlify sadece **frontend** kısmını deploy eder. Backend için ayrı bir hosting servisi (Heroku, Railway, Render, vb.) kullanmanız gerekir.

## Netlify Deploy Adımları

### Yöntem 1: Netlify Web Arayüzü (Önerilen)

1. **Netlify.com'a giriş yapın**
   - https://www.netlify.com adresine gidin
   - GitHub hesabınızla giriş yapın

2. **"Add new site" → "Import an existing project"**
   - GitHub'ı seçin
   - Repository'yi seçin: `twitter-video-downloader`

3. **Build ayarlarını yapılandırın:**
   ```
   Base directory: frontend
   Build command: npm install && npm run build
   Publish directory: frontend/dist
   ```

4. **Environment Variables (Opsiyonel):**
   Eğer backend URL'i farklı bir yerde ise:
   ```
   VITE_API_URL = https://your-backend-url.com/api
   ```

5. **"Deploy site" butonuna tıklayın**

### Yöntem 2: Netlify CLI

```powershell
# Netlify CLI kurulumu (eğer yoksa)
npm install -g netlify-cli

# Netlify'e giriş yap
netlify login

# Frontend klasörüne git
cd frontend

# Site'i deploy et
netlify deploy --prod
```

### Yöntem 3: GitHub'dan Otomatik Deploy

1. Netlify'da site oluşturduktan sonra
2. GitHub repository'nize `netlify.toml` dosyası eklenecek (zaten eklendi)
3. Her push'ta otomatik deploy yapılacak

## Backend Deploy (Ayrı Hosting Gerekli)

Frontend Netlify'de çalışırken, backend için ayrı bir hosting servisi kullanmanız gerekir:

### Railway (Önerilen - Kolay)

1. https://railway.app adresine gidin
2. GitHub ile giriş yapın
3. "New Project" → "Deploy from GitHub repo"
4. `twitter-video-downloader` repository'sini seçin
5. Root directory: `backend` olarak ayarlayın
6. Start command: `npm start`
7. Environment variables ekleyin:
   ```
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://your-netlify-site.netlify.app
   ```

### Render

1. https://render.com adresine gidin
2. "New Web Service" seçin
3. GitHub repository'yi bağlayın
4. Ayarlar:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`

### Heroku

1. https://heroku.com adresine gidin
2. Yeni app oluşturun
3. GitHub'ı bağlayın
4. Root directory: `backend` olarak ayarlayın

## Frontend'de Backend URL'ini Güncelleme

Backend'i deploy ettikten sonra, frontend'deki API URL'ini güncellemeniz gerekir:

1. Netlify'da Environment Variables ekleyin:
   ```
   VITE_API_URL = https://your-backend-url.railway.app/api
   ```

2. Veya `frontend/src/services/api.js` dosyasını düzenleyin:
   ```javascript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend-url.com/api';
   ```

## Sorun Giderme

### "Page not found" hatası
- Base directory'nin `frontend` olduğundan emin olun
- Publish directory'nin `frontend/dist` olduğundan emin olun
- Build'in başarılı olduğunu kontrol edin

### "Module not found" hatası
- `npm install` komutunun çalıştığından emin olun
- Node version'ın 18 olduğundan emin olun

### CORS hatası
- Backend'deki `CORS_ORIGIN` environment variable'ını Netlify URL'inizle güncelleyin
- Örnek: `CORS_ORIGIN=https://your-site.netlify.app`

### API bağlantı hatası
- Backend'in çalıştığından emin olun
- Frontend'deki `VITE_API_URL` environment variable'ını kontrol edin
- Browser console'da network hatalarını kontrol edin

## Hızlı Test

Deploy sonrası test etmek için:
1. Netlify URL'inizi açın
2. Browser console'u açın (F12)
3. Bir Twitter URL'i deneyin
4. Network tab'ında API isteklerini kontrol edin

