import { useState } from 'react';

function VideoInfo({ videoInfo, onDownload, downloading, downloadProgress }) {
  const [selectedQuality, setSelectedQuality] = useState(null);

  const handleDownloadClick = () => {
    onDownload(selectedQuality);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Thumbnail */}
        {videoInfo.thumbnail && (
          <div className="flex-shrink-0">
            <img
              src={videoInfo.thumbnail}
              alt="Video thumbnail"
              className="w-full md:w-64 h-auto rounded-lg object-cover"
            />
          </div>
        )}

        {/* Video Info */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {videoInfo.title || 'Twitter Video'}
          </h2>
          
          {videoInfo.author && (
            <p className="text-gray-600 mb-4">
              by <span className="font-semibold">{videoInfo.author}</span>
            </p>
          )}

          {videoInfo.tweetId && (
            <p className="text-sm text-gray-500 mb-4">
              Tweet ID: {videoInfo.tweetId}
            </p>
          )}

          {/* Quality Selection */}
          {videoInfo.formats && videoInfo.formats.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Quality:
              </label>
              <select
                value={selectedQuality || videoInfo.formats[0].quality}
                onChange={(e) => setSelectedQuality(e.target.value)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={downloading}
              >
                {videoInfo.formats.map((format, index) => (
                  <option key={index} value={format.quality}>
                    {format.quality} {format.format ? `(${format.format})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Download Button */}
          <button
            onClick={handleDownloadClick}
            disabled={downloading}
            className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Downloading... {downloadProgress > 0 && `${downloadProgress}%`}
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Video
              </>
            )}
          </button>

          {/* Download Progress */}
          {downloading && downloadProgress > 0 && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${downloadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Note */}
          {(!videoInfo.formats || videoInfo.formats.length === 0) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Video formats not available. The download may still work, but quality selection is not available.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Original URL */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500">
          <strong>URL:</strong>{' '}
          <a
            href={videoInfo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline break-all"
          >
            {videoInfo.url}
          </a>
        </p>
      </div>
    </div>
  );
}

export default VideoInfo;

