# Twitter Video Downloader

A modern web application for downloading videos from Twitter/X posts. Built with React, Node.js, and Express.

## Features

- 🎥 Extract video information from Twitter/X posts
- 📥 Download videos in different qualities (when available)
- 🎨 Modern, responsive UI with Tailwind CSS
- ⚡ Fast and efficient video extraction
- 🔒 Input validation and error handling
- 📱 Mobile-friendly design

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express
- CORS
- Express Rate Limiting

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

### 1. Clone or navigate to the project

```bash
cd twitter-video-downloader
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd ../backend
cp .env.example .env
```

Edit `.env` with your configuration:

```
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Running the Application

### Development Mode

1. **Start the Backend Server:**

```bash
cd backend
npm run dev
```

The backend will run on `http://localhost:3001`

2. **Start the Frontend Development Server:**

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

### Production Mode

1. **Build the Frontend:**

```bash
cd frontend
npm run build
```

2. **Start the Backend:**

```bash
cd backend
npm start
```

## Usage

1. Open the application in your browser (default: `http://localhost:5173`)
2. Paste a Twitter/X post URL that contains a video
3. Click "Extract Video" to get video information
4. Select quality (if available) and click "Download Video"

## API Endpoints

### POST `/api/extract`
Extract video information from a Twitter URL.

**Request Body:**
```json
{
  "url": "https://twitter.com/username/status/1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tweetId": "1234567890",
    "url": "https://twitter.com/username/status/1234567890",
    "title": "User's Tweet",
    "thumbnail": "https://...",
    "author": "username",
    "formats": [...]
  }
}
```

### GET `/api/download`
Download video from a Twitter URL.

**Query Parameters:**
- `url` (required): Twitter post URL
- `quality` (optional): Preferred video quality

## Project Structure

```
twitter-video-downloader/
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Important Notes

- Twitter's official API does not support video downloads directly
- This application uses alternative methods to extract video URLs
- For production use, consider implementing yt-dlp or similar tools on the server
- Always respect copyright and Twitter's Terms of Service
- Users are responsible for ensuring they have permission to download content

## Deployment

### Netlify (Frontend)

1. **Netlify.com'a giriş yapın** ve "Add new site" → "Import an existing project" seçin
2. **GitHub repository'nizi seçin**
3. **Build ayarlarını yapılandırın:**
   ```
   Base directory: frontend
   Build command: npm install && npm run build
   Publish directory: frontend/dist
   ```
4. **Environment Variables ekleyin (opsiyonel):**
   ```
   VITE_API_URL = https://your-backend-url.com/api
   ```
5. **"Deploy site" butonuna tıklayın**

**Not:** `netlify.toml` dosyası zaten projede mevcut, bu ayarları otomatik olarak uygular.

Detaylı talimatlar için `NETLIFY_DEPLOY.md` dosyasına bakın.

### Backend Hosting

Netlify sadece frontend'i host eder. Backend için ayrı bir servis gerekir:
- **Railway** (Önerilen): https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com

Backend deploy talimatları için `NETLIFY_DEPLOY.md` dosyasına bakın.

## Troubleshooting

### Netlify "Page not found" hatası
- **Base directory**'nin `frontend` olduğundan emin olun
- **Publish directory**'nin `frontend/dist` olduğundan emin olun
- Build loglarını kontrol edin
- `netlify.toml` dosyasının doğru yapılandırıldığından emin olun

### Backend won't start
- Check if port 3001 is available
- Verify `.env` file exists and is properly configured
- Ensure all dependencies are installed

### Frontend won't connect to backend
- Verify backend is running on port 3001
- Check CORS_ORIGIN in backend `.env` matches frontend URL
- Check browser console for CORS errors
- Production'da backend URL'ini environment variable olarak ayarlayın

### Video extraction fails
- Verify the Twitter URL is valid and contains a video
- Check backend logs for detailed error messages
- Some videos may be protected or unavailable

## License

MIT

## Disclaimer

This tool is for educational purposes. Users must comply with Twitter's Terms of Service and respect copyright laws when downloading content.

