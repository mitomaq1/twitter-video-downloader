# 🚀 Netlify Deploy Rehberi

## Hızlı Başlangıç

### Adım 1: Netlify'de Site Oluştur

1. **https://www.netlify.com** adresine gidin
2. GitHub hesabınızla giriş yapın
3. **"Add new site"** → **"Import an existing project"** tıklayın
4. **GitHub** seçeneğini seçin
5. Repository'yi seçin: **`twitter-video-downloader`**
6. **"Deploy site"** butonuna tıklayın

### Adım 2: Build Ayarları (Otomatik Algılanır)

`netlify.toml` dosyası sayesinde ayarlar otomatik algılanır:

```
✅ Base directory: frontend
✅ Build command: npm install && npm run build  
✅ Publish directory: frontend/dist
```

Eğer otomatik algılanmazsa, manuel olarak şu ayarları yapın:

1. Site Settings → Build & deploy → Build settings
2. "Edit settings" tıklayın
3. Ayarları girin:
   - **Base directory:** `frontend`
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `frontend/dist`

### Adım 3: Deploy

- Netlify otomatik olarak deploy edecek
- Deploy tamamlandığında site URL'iniz hazır olacak
- Her GitHub push'unda otomatik deploy yapılacak

## ✅ Kontrol Listesi

- [x] GitHub repository'de `netlify.toml` dosyası var
- [x] Frontend klasöründe `package.json` var
- [x] Build komutu doğru yapılandırılmış
- [x] Publish directory doğru ayarlanmış

## 🔧 Sorun Giderme

### "Page not found" hatası
**Çözüm:** Build ayarlarını kontrol edin:
- Base directory: `frontend` olmalı
- Publish directory: `frontend/dist` olmalı

### Build hatası
**Çözüm:** 
- Build loglarını kontrol edin
- Node version 18 olduğundan emin olun
- `npm install` komutunun çalıştığını kontrol edin

### Site boş görünüyor
**Çözüm:**
- Build'in başarılı olduğunu kontrol edin
- Browser console'da hata var mı bakın
- Network tab'ında dosyalar yükleniyor mu kontrol edin

## 📝 Notlar

- Netlify sadece **frontend**'i host eder
- Backend için ayrı hosting gerekir (Railway, Render, vb.)
- Backend olmadan API çağrıları çalışmaz
- Backend deploy için `NETLIFY_DEPLOY.md` dosyasına bakın

## 🎉 Başarılı Deploy Sonrası

Site'iniz şu formatta bir URL'de olacak:
```
https://random-name-12345.netlify.app
```

Veya özel domain ekleyebilirsiniz!

