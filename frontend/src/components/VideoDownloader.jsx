import { useState } from 'react';
import { extractVideoInfo, downloadVideo } from '../services/api';
import { validateTwitterUrl } from '../utils/validation';
import VideoInfo from './VideoInfo';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

function VideoDownloader() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleUrlChange = (e) => {
    setUrl(e.target.value);
    setError(null);
    setVideoInfo(null);
  };

  const handleExtract = async () => {
    // Validate URL
    const validation = validateTwitterUrl(url);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    setError(null);
    setVideoInfo(null);

    try {
      const response = await extractVideoInfo(url);
      if (response.success && response.data) {
        setVideoInfo(response.data);
      } else {
        setError('Failed to extract video information');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while extracting video info');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (quality = null) => {
    if (!videoInfo) {
      setError('Please extract video information first');
      return;
    }

    if (!url.trim()) {
      setError('URL is required');
      return;
    }

    setDownloading(true);
    setError(null);
    setDownloadProgress(0);

    try {
      const blob = await downloadVideo(url, quality);
      
      // Check if blob is valid
      if (!blob || blob.size === 0) {
        throw new Error('Downloaded file is empty or invalid');
      }
      
      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const filename = `twitter-video-${videoInfo.tweetId || Date.now()}.mp4`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      setDownloadProgress(100);
    } catch (err) {
      setError(err.message || 'An error occurred while downloading the video');
      setDownloadProgress(0);
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadProgress(0), 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleExtract();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              onChange={handleUrlChange}
              onKeyPress={handleKeyPress}
              placeholder="Paste Twitter/X post URL here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || downloading}
            />
          </div>
          <button
            onClick={handleExtract}
            disabled={loading || downloading || !url.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
          >
            {loading ? 'Extracting...' : 'Extract Video'}
          </button>
        </div>

        {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

        {loading && (
          <div className="mt-4">
            <LoadingSpinner message="Extracting video information..." />
          </div>
        )}
      </div>

      {videoInfo && (
        <VideoInfo
          videoInfo={videoInfo}
          onDownload={handleDownload}
          downloading={downloading}
          downloadProgress={downloadProgress}
        />
      )}
    </div>
  );
}

export default VideoDownloader;

