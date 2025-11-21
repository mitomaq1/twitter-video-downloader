import axios from 'axios';

/**
 * Extracts video information from Twitter URL
 * @param {string} url - Twitter post URL
 * @returns {Promise<Object>} Video information
 */
export async function extractVideoInfo(url) {
  try {
    // Normalize URL
    const normalizedUrl = normalizeTwitterUrl(url);

    // Extract tweet ID from URL first
    const tweetIdMatch = normalizedUrl.match(/\/status\/(\d+)/);
    if (!tweetIdMatch) {
      throw new Error('Could not extract tweet ID from URL. Please ensure the URL is a valid Twitter/X post.');
    }
    const tweetId = tweetIdMatch[1];

    // Use Twitter's oEmbed API to get basic info
    const oEmbedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(normalizedUrl)}`;
    
    let oEmbedData;
    try {
      const oEmbedResponse = await axios.get(oEmbedUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      oEmbedData = oEmbedResponse.data;
    } catch (error) {
      console.error('oEmbed API error:', error.message);
      // Continue without oEmbed data - not critical
    }

    // Initialize video info
    const videoInfo = {
      tweetId,
      url: normalizedUrl,
      title: oEmbedData?.author_name ? `${oEmbedData.author_name}'s Tweet` : 'Twitter Video',
      thumbnail: oEmbedData?.thumbnail_url || null,
      author: oEmbedData?.author_name || null,
      html: oEmbedData?.html || null,
      formats: []
    };

    // Try to extract video URLs from the page
    try {
      const pageResponse = await axios.get(normalizedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      // Extract video URLs from page content
      const videoUrls = extractVideoUrlsFromPage(pageResponse.data);
      if (videoUrls.length > 0) {
        videoInfo.formats = videoUrls;
      }
    } catch (error) {
      console.error('Page fetch error:', error.message);
      // Continue without video URLs - they'll be extracted during download
      // This is not a fatal error
    }

    return videoInfo;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Tweet not found. The URL may be invalid or the tweet may have been deleted.');
      }
      throw new Error(`Twitter API error: ${error.response.status} ${error.response.statusText}`);
    }
    throw new Error(`Failed to extract video info: ${error.message}`);
  }
}

/**
 * Downloads video from Twitter URL
 * @param {string} url - Twitter post URL
 * @param {string} quality - Preferred quality (optional)
 * @param {Object} res - Express response object
 */
export async function downloadVideo(url, quality, res) {
  try {
    const normalizedUrl = normalizeTwitterUrl(url);

    // Extract video info first
    const videoInfo = await extractVideoInfo(normalizedUrl);
    
    // Try to get direct video URL
    const videoUrl = await getDirectVideoUrl(normalizedUrl);
    
    if (!videoUrl) {
      // If we can't get direct URL, return the video info with instructions
      return res.status(404).json({
        error: {
          message: 'Direct video URL not available. Please use the extract endpoint to get video information.',
          videoInfo: videoInfo,
          note: 'For full download functionality, install yt-dlp on the server and configure it in the service.'
        }
      });
    }

    // Stream video from Twitter CDN
    const videoResponse = await axios.get(videoUrl, {
      responseType: 'stream',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://twitter.com/'
      }
    });

    // Set headers for video download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="twitter-video-${videoInfo.tweetId}.mp4"`);
    res.setHeader('Content-Length', videoResponse.headers['content-length'] || '');

    // Pipe video stream to response
    videoResponse.data.pipe(res);
  } catch (error) {
    if (error.response) {
      throw new Error(`Video download error: ${error.response.status} ${error.response.statusText}`);
    }
    throw new Error(`Failed to download video: ${error.message}`);
  }
}

/**
 * Gets direct video URL from Twitter post
 * @param {string} url - Twitter post URL
 * @returns {Promise<string|null>} Direct video URL or null
 */
async function getDirectVideoUrl(url) {
  try {
    // Fetch the Twitter page
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = response.data;

    // Try multiple methods to extract video URL
    // Method 1: Look for video URLs in JSON-LD or script tags
    const jsonLdMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/i);
    if (jsonLdMatch) {
      try {
        const jsonData = JSON.parse(jsonLdMatch[1]);
        if (jsonData.contentUrl) {
          return jsonData.contentUrl;
        }
      } catch (e) {
        // Continue to next method
      }
    }

    // Method 2: Look for video URLs in page source
    const videoUrlPatterns = [
      /"video_url":"([^"]+)"/i,
      /"contentUrl":"([^"]+\.mp4[^"]*)"/i,
      /https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi
    ];

    for (const pattern of videoUrlPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        // Return the first valid video URL
        for (const match of matches) {
          const url = match.replace(/^"video_url":"|"$|"contentUrl":"|"$/g, '');
          if (url.includes('.mp4') || url.includes('video')) {
            return url;
          }
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting direct video URL:', error.message);
    return null;
  }
}

/**
 * Normalizes Twitter URL to standard format
 * @param {string} url - Twitter URL
 * @returns {string} Normalized URL
 */
function normalizeTwitterUrl(url) {
  let normalized = url.trim();
  
  // Convert x.com to twitter.com for consistency
  normalized = normalized.replace(/x\.com/g, 'twitter.com');
  
  // Remove mobile prefix
  normalized = normalized.replace(/mobile\.twitter\.com/g, 'twitter.com');
  
  // Ensure https
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }

  return normalized;
}

/**
 * Extracts video URLs from Twitter page HTML
 * @param {string} html - Page HTML content
 * @returns {Array} Array of video format objects
 */
function extractVideoUrlsFromPage(html) {
  const formats = [];
  
  // Try to find video URLs in the HTML
  // Twitter embeds video URLs in various formats
  // This is a simplified extraction - production would need more robust parsing
  
  // Look for video URLs in script tags (Twitter embeds data as JSON)
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    for (const script of scriptMatches) {
      // Try to find video URLs
      const videoUrlMatches = script.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi);
      if (videoUrlMatches) {
        videoUrlMatches.forEach((url, index) => {
          formats.push({
            url: url,
            quality: `format_${index + 1}`,
            format: 'mp4'
          });
        });
      }
    }
  }

  return formats;
}

