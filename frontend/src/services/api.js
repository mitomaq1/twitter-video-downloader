import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Extracts video information from Twitter URL
 * @param {string} url - Twitter post URL
 * @returns {Promise<Object>} Video information
 */
export async function extractVideoInfo(url) {
  try {
    const response = await api.post('/extract', { url });
    return response.data;
  } catch (error) {
    // Daha detaylı hata mesajları
    if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
      throw new Error('Backend server is not available. Please make sure the backend is deployed and running. Check DEPLOY.md for deployment instructions.');
    }
    if (error.response) {
      const errorMessage = error.response.data?.error?.message || 'Failed to extract video info';
      throw new Error(errorMessage);
    }
    if (error.message.includes('timeout')) {
      throw new Error('Request timed out. The server may be slow or unavailable.');
    }
    throw new Error(error.message || 'Network error. Please check your connection and try again.');
  }
}

/**
 * Downloads video from Twitter URL
 * @param {string} url - Twitter post URL
 * @param {string} quality - Preferred quality (optional)
 * @returns {Promise<Blob>} Video blob
 */
export async function downloadVideo(url, quality = null) {
  try {
    const params = new URLSearchParams({ url });
    if (quality) {
      params.append('quality', quality);
    }

    const response = await api.get('/download', {
      params,
      responseType: 'blob',
      timeout: 120000, // 2 minutes for large videos
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          // Note: This won't work directly, would need to be handled differently
          // For now, we'll rely on the browser's native download progress
        }
      }
    });

    // Check if response is actually an error JSON wrapped in blob
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const errorData = JSON.parse(text);
      throw new Error(errorData.error?.message || 'Failed to download video');
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      // Try to parse error message from blob
      if (error.response.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error?.message || 'Failed to download video');
        } catch {
          throw new Error('Failed to download video');
        }
      }
      throw new Error(error.response.data?.error?.message || 'Failed to download video');
    }
    throw new Error(error.message || 'Network error');
  }
}

export default api;

