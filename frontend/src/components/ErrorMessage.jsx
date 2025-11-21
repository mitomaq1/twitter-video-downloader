function ErrorMessage({ message, onClose, showBackendHelp = false }) {
  return (
    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
      <svg
        className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <div className="flex-1">
        <p className="text-sm text-red-800 font-medium">Error</p>
        <p className="text-sm text-red-700">{message}</p>
        {showBackendHelp && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-xs text-yellow-800 font-semibold mb-1">💡 Backend Deploy Gerekli</p>
            <p className="text-xs text-yellow-700 mb-2">
              Backend server deploy edilmemiş. Uygulamanın çalışması için backend'i deploy etmeniz gerekiyor.
            </p>
            <a
              href="https://github.com/mitomaq1/twitter-video-downloader/blob/main/QUICK_DEPLOY_BACKEND.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              📖 Backend Deploy Rehberi (Railway/Render/Heroku)
            </a>
          </div>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 flex-shrink-0"
          aria-label="Close error message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;

