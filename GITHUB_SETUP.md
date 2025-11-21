# GitHub'a Yükleme Talimatları

## Adım 1: GitHub'da Repository Oluştur

1. GitHub.com'a giriş yapın
2. Sağ üst köşedeki "+" butonuna tıklayın
3. "New repository" seçeneğini seçin
4. Repository adını girin: `twitter-video-downloader` (veya istediğiniz isim)
5. **Public** veya **Private** seçin
6. **"Initialize this repository with a README"** seçeneğini **İŞARETLEMEYİN**
7. "Create repository" butonuna tıklayın

## Adım 2: Repository'yi Yerel Projeye Bağla

### Yöntem 1: PowerShell Script Kullan (Önerilen)

```powershell
cd C:\Users\LetsGetTheWork\neww\twitter-video-downloader
.\push-to-github.ps1 -RepoName "twitter-video-downloader" -GitHubUsername "your-github-username"
```

Script sizi yönlendirecektir.

### Yöntem 2: Manuel Komutlar

```powershell
cd C:\Users\LetsGetTheWork\neww\twitter-video-downloader

# Remote ekle (GitHub kullanıcı adınızı ve repo adını değiştirin)
git remote add origin https://github.com/YOUR-USERNAME/twitter-video-downloader.git

# Branch'i main olarak değiştir (eğer master ise)
git branch -M main

# GitHub'a push et
git push -u origin main
```

## Adım 3: GitHub Kimlik Doğrulama

Eğer push sırasında kimlik doğrulama hatası alırsanız:

### Personal Access Token Kullan (Önerilen)

1. GitHub.com → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Token'a bir isim verin (örn: "Twitter Downloader")
4. "repo" scope'unu seçin
5. Token'ı kopyalayın
6. Push yaparken şifre yerine bu token'ı kullanın

### Alternatif: GitHub CLI

```powershell
# GitHub CLI kurulumu (eğer yoksa)
winget install GitHub.cli

# GitHub'a giriş yap
gh auth login

# Repository oluştur ve push et
gh repo create twitter-video-downloader --public --source=. --remote=origin --push
```

## Sorun Giderme

### "Repository not found" hatası
- GitHub'da repository'nin oluşturulduğundan emin olun
- Repository adının ve kullanıcı adının doğru olduğunu kontrol edin

### "Authentication failed" hatası
- GitHub kullanıcı adı ve şifrenizi kontrol edin
- Personal Access Token kullanmayı deneyin
- GitHub CLI kullanmayı deneyin

### "Branch name" hatası
```powershell
git branch -M main
```

## Başarılı Push Sonrası

Repository'niz şu adreste olacak:
```
https://github.com/YOUR-USERNAME/twitter-video-downloader
```

## Sonraki Adımlar

1. README.md dosyasını GitHub'da görüntüleyin
2. İsterseniz GitHub Pages ile deploy edin
3. Issues ve Pull Requests açabilirsiniz
4. Collaborators ekleyebilirsiniz

