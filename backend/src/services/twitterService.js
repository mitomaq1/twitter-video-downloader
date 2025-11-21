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

    // Try to extract video URLs from the page (only for this specific tweet)
    try {
      const pageResponse = await axios.get(normalizedUrl, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5'
        }
      });

      // Extract video URLs from page content - ONLY for this tweet ID
      const videoUrls = extractVideoUrlsFromPage(pageResponse.data, tweetId);
      if (videoUrls.length > 0) {
        videoInfo.formats = videoUrls;
        console.log(`[EXTRACT] Found ${videoUrls.length} video formats for tweet ${tweetId}`);
      } else {
        console.log(`[EXTRACT] No video formats found for tweet ${tweetId}`);
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
    console.log(`[DOWNLOAD] Starting download for URL: ${normalizedUrl}`);

    // Extract video info first to get tweet ID
    const videoInfo = await extractVideoInfo(normalizedUrl);
    console.log(`[DOWNLOAD] Extracted video info - Tweet ID: ${videoInfo.tweetId}`);
    
    // Try to get direct video URL using tweet ID to ensure we get the correct video
    const videoUrl = await getDirectVideoUrl(normalizedUrl, videoInfo.tweetId);
    
    if (!videoUrl) {
      console.error(`[DOWNLOAD] No video URL found for tweet ${videoInfo.tweetId}`);
      // If we can't get direct URL, return the video info with instructions
      return res.status(404).json({
        error: {
          message: 'Could not extract video URL for this tweet. Twitter\'s HTML structure may have changed, or the video may not be directly accessible.',
          videoInfo: videoInfo,
          note: 'For reliable video downloads, consider using yt-dlp on the server. The current method relies on parsing Twitter\'s HTML which can be unreliable.',
          suggestion: 'Try using a dedicated Twitter video downloader tool or browser extension for more reliable results.'
        }
      });
    }

    console.log(`[DOWNLOAD] Found video URL: ${videoUrl}`);
    console.log(`[DOWNLOAD] Video URL length: ${videoUrl.length}`);
    console.log(`[DOWNLOAD] Video URL domain: ${new URL(videoUrl).hostname}`);
    
    // Verify the URL looks like a valid Twitter video URL
    if (!videoUrl.includes('video.twimg.com') && !videoUrl.includes('twimg.com')) {
      console.warn(`[DOWNLOAD] WARNING: Video URL does not appear to be from Twitter CDN: ${videoUrl}`);
      console.warn(`[DOWNLOAD] This might be the wrong video!`);
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
 * @param {string} tweetId - Tweet ID to match the correct video
 * @returns {Promise<string|null>} Direct video URL or null
 */
async function getDirectVideoUrl(url, tweetId) {
  try {
    // Extract tweet ID from URL if not provided
    if (!tweetId) {
      const tweetIdMatch = url.match(/\/status\/(\d+)/);
      tweetId = tweetIdMatch ? tweetIdMatch[1] : null;
    }

    if (!tweetId) {
      console.error('No tweet ID available for video extraction');
      return null;
    }

    // Fetch the Twitter page with better headers to get JavaScript-rendered content
    const response = await axios.get(url, {
      timeout: 20000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Referer': 'https://twitter.com/',
        'Cookie': 'lang=en'
      }
    });

    const html = response.data;
    
    console.log(`Extracting video for tweet ID: ${tweetId}`);

    // Method 1: Look for tweet-specific JSON data in script tags
    // Twitter stores tweet data in various script tags with JSON
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        // Only process scripts that contain the tweet ID
        if (!script.includes(tweetId)) continue;
        
        // Try to find JSON objects that contain both tweet ID and video data
        // Look for patterns like: "id_str":"1234567890" followed by video URLs
        const tweetDataPattern = new RegExp(`"id_str"\\s*:\\s*"${tweetId}"[\\s\\S]{0,50000}`, 'i');
        const tweetDataMatch = script.match(tweetDataPattern);
        
        if (tweetDataMatch) {
          const tweetData = tweetDataMatch[0];
          
          // Look for video variants array - Twitter stores videos in variants
          const variantsPattern = /"variants"\s*:\s*\[([^\]]+)\]/i;
          const variantsMatch = tweetData.match(variantsPattern);
          
          if (variantsMatch) {
            // Extract all URLs from variants
            const urlMatches = variantsMatch[1].match(/"url"\s*:\s*"([^"]+)"/gi);
            if (urlMatches) {
              // Find the highest quality video (usually the last one or one without bitrate in name)
              for (let i = urlMatches.length - 1; i >= 0; i--) {
                const urlMatch = urlMatches[i].match(/"url"\s*:\s*"([^"]+)"/i);
                if (urlMatch && urlMatch[1]) {
                  let videoUrl = urlMatch[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
                  if (videoUrl.includes('.mp4') || videoUrl.includes('video.twimg.com')) {
                    console.log(`Found video URL in variants: ${videoUrl}`);
                    return videoUrl;
                  }
                }
              }
            }
          }
          
          // Fallback: Look for direct video_url patterns within this tweet's data
          const videoUrlPatterns = [
            new RegExp(`"video_url_https"\\s*:\\s*"([^"]+)"`, 'i'),
            new RegExp(`"video_url"\\s*:\\s*"([^"]+)"`, 'i'),
            new RegExp(`"contentUrl"\\s*:\\s*"([^"]+\\.mp4[^"]*)"`, 'i')
          ];

          for (const pattern of videoUrlPatterns) {
            const matches = tweetData.match(pattern);
            if (matches && matches[1]) {
              let videoUrl = matches[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
              if (videoUrl.includes('.mp4') || videoUrl.includes('video.twimg.com')) {
                console.log(`Found video URL: ${videoUrl}`);
                return videoUrl;
              }
            }
          }
        }
      }
    }

    // Method 2: Look for video URLs in the context of the specific tweet
    // Find HTML sections that contain the tweet ID and look for video elements nearby
    if (tweetId) {
      // Look for video tags or sources near the tweet ID
      const tweetContextPattern = new RegExp(`[\\s\\S]{0,20000}${tweetId}[\\s\\S]{0,20000}`, 'i');
      const tweetContextMatch = html.match(tweetContextPattern);
      
      if (tweetContextMatch) {
        const context = tweetContextMatch[0];
        
        // Look for video source tags
        const videoSourceMatches = context.match(/<source[^>]+src=["']([^"']+\.mp4[^"']*)["']/gi);
        if (videoSourceMatches) {
          for (const match of videoSourceMatches) {
            const urlMatch = match.match(/src=["']([^"']+)["']/i);
            if (urlMatch && urlMatch[1]) {
              const videoUrl = urlMatch[1];
              if (videoUrl.includes('video.twimg.com') || videoUrl.includes('.mp4')) {
                console.log(`Found video URL in source tag: ${videoUrl}`);
                return videoUrl;
              }
            }
          }
        }
        
        // Look for video URLs in data attributes
        const dataVideoMatches = context.match(/data-video-url=["']([^"']+\.mp4[^"']*)["']/gi);
        if (dataVideoMatches) {
          for (const match of dataVideoMatches) {
            const urlMatch = match.match(/data-video-url=["']([^"']+)["']/i);
            if (urlMatch && urlMatch[1]) {
              console.log(`Found video URL in data attribute: ${urlMatch[1]}`);
              return urlMatch[1];
            }
          }
        }
      }
    }

    // Method 3: Parse entire JSON structure to find tweet-specific video
    // Twitter stores all tweet data in a large JSON object
    try {
      // Look for window.__INITIAL_STATE__ or similar global state objects
      const statePatterns = [
        /window\.__INITIAL_STATE__\s*=\s*({[\s\S]+?});/i,
        /window\.__INITIAL_DATA__\s*=\s*({[\s\S]+?});/i,
        /"statuses"\s*:\s*\[([^\]]+)\]/i
      ];

      for (const pattern of statePatterns) {
        const stateMatch = html.match(pattern);
        if (stateMatch) {
          try {
            // Try to parse as JSON (might be partial)
            const jsonStr = stateMatch[1] || stateMatch[0];
            // Find the specific tweet object
            const tweetObjPattern = new RegExp(`"id_str"\\s*:\\s*"${tweetId}"[\\s\\S]{0,100000}?"media"\\s*:[\\s\\S]{0,50000}?`, 'i');
            const tweetObjMatch = jsonStr.match(tweetObjPattern);
            
            if (tweetObjMatch) {
              const tweetObj = tweetObjMatch[0];
              
              // Look for video_info or variants in this specific tweet object
              const videoInfoPattern = /"video_info"\s*:\s*{[\s\S]{0,10000}?"variants"\s*:\s*\[([^\]]+)\]/i;
              const videoInfoMatch = tweetObj.match(videoInfoPattern);
              
              if (videoInfoMatch) {
                const variantsStr = videoInfoMatch[1];
                const urlMatches = variantsStr.match(/"url"\s*:\s*"([^"]+)"/gi);
                
                if (urlMatches && urlMatches.length > 0) {
                  // Get the highest quality (usually the last one or highest bitrate)
                  let bestUrl = null;
                  let highestBitrate = 0;
                  
                  for (const match of urlMatches) {
                    const urlMatch = match.match(/"url"\s*:\s*"([^"]+)"/i);
                    if (urlMatch && urlMatch[1]) {
                      let videoUrl = urlMatch[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
                      
                      // Check bitrate if available
                      const bitrateMatch = variantsStr.match(/"bitrate"\s*:\s*(\d+)/i);
                      const bitrate = bitrateMatch ? parseInt(bitrateMatch[1]) : 0;
                      
                      if (videoUrl.includes('.mp4') || videoUrl.includes('video.twimg.com')) {
                        if (bitrate > highestBitrate || !bestUrl) {
                          bestUrl = videoUrl;
                          highestBitrate = bitrate;
                        }
                      }
                    }
                  }
                  
                  if (bestUrl) {
                    console.log(`Found video URL in tweet JSON object: ${bestUrl}`);
                    return bestUrl;
                  }
                }
              }
            }
          } catch (e) {
            // Continue to next method
            console.log('JSON parsing failed, trying next method');
          }
        }
      }
    } catch (error) {
      console.log('Method 3 failed:', error.message);
    }

    // Method 4: Last resort - DO NOT use generic video URLs
    // Instead, return null and let the user know we couldn't find the specific video
    console.error(`Could not find video URL for tweet ${tweetId} - Twitter HTML structure may have changed`);
    console.error('This is a known limitation. Consider using yt-dlp for more reliable video extraction.');
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
 * Extracts video URLs from Twitter page HTML - ONLY for the specific tweet ID
 * @param {string} html - Page HTML content
 * @param {string} tweetId - Tweet ID to match
 * @returns {Array} Array of video format objects
 */
function extractVideoUrlsFromPage(html, tweetId) {
  const formats = [];
  
  if (!tweetId) {
    console.warn('[EXTRACT] No tweet ID provided for video URL extraction');
    return formats;
  }
  
  // Look for video URLs in script tags that contain the tweet ID
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    for (const script of scriptMatches) {
      // Only process scripts that contain the tweet ID
      if (!script.includes(tweetId)) continue;
      
      // Try to find JSON data for this specific tweet
      const tweetDataPattern = new RegExp(`"id_str"\\s*:\\s*"${tweetId}"[\\s\\S]{0,50000}`, 'i');
      const tweetDataMatch = script.match(tweetDataPattern);
      
      if (tweetDataMatch) {
        const tweetData = tweetDataMatch[0];
        
        // Look for video variants array
        const variantsPattern = /"variants"\s*:\s*\[([^\]]+)\]/i;
        const variantsMatch = tweetData.match(variantsPattern);
        
        if (variantsMatch) {
          // Extract URLs from variants
          const urlMatches = variantsMatch[1].match(/"url"\s*:\s*"([^"]+)"/gi);
          if (urlMatches) {
            urlMatches.forEach((match, index) => {
              const urlMatch = match.match(/"url"\s*:\s*"([^"]+)"/i);
              if (urlMatch && urlMatch[1]) {
                let videoUrl = urlMatch[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
                if (videoUrl.includes('.mp4') || videoUrl.includes('video.twimg.com')) {
                  // Try to determine quality from URL
                  let quality = 'unknown';
                  if (videoUrl.includes('bitrate')) {
                    const bitrateMatch = videoUrl.match(/bitrate[=:](\d+)/i);
                    if (bitrateMatch) {
                      quality = `${bitrateMatch[1]}kbps`;
                    }
                  } else if (videoUrl.includes('playlist')) {
                    quality = 'playlist';
                  } else {
                    quality = `format_${index + 1}`;
                  }
                  
                  formats.push({
                    url: videoUrl,
                    quality: quality,
                    format: 'mp4'
                  });
                }
              }
            });
          }
        }
        
        // Also look for direct video_url patterns
        const directVideoPatterns = [
          new RegExp(`"video_url_https"\\s*:\\s*"([^"]+)"`, 'i'),
          new RegExp(`"video_url"\\s*:\\s*"([^"]+)"`, 'i')
        ];
        
        for (const pattern of directVideoPatterns) {
          const matches = tweetData.match(pattern);
          if (matches && matches[1]) {
            let videoUrl = matches[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
            if (videoUrl.includes('.mp4') || videoUrl.includes('video.twimg.com')) {
              // Check if we already have this URL
              if (!formats.some(f => f.url === videoUrl)) {
                formats.push({
                  url: videoUrl,
                  quality: 'default',
                  format: 'mp4'
                });
              }
            }
          }
        }
      }
    }
  }

  console.log(`[EXTRACT] Extracted ${formats.length} video formats for tweet ${tweetId}`);
  return formats;
}

