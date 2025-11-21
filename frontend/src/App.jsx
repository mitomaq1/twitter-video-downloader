import VideoDownloader from './components/VideoDownloader';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Twitter Video Downloader
          </h1>
          <p className="text-gray-600">
            Download videos from Twitter/X posts easily
          </p>
        </header>
        <VideoDownloader />
      </div>
      <footer className="mt-8 py-4 text-center text-sm text-gray-600">
        <p className="mb-2">
          This tool is for educational purposes only.
        </p>
        <p className="text-xs">
          Please respect copyright laws and Twitter's Terms of Service when downloading content.
        </p>
      </footer>
    </div>
  );
}

export default App;

