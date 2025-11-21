/**
 * Validates Twitter URL format
 * @param {string} url - Twitter URL to validate
 * @returns {{isValid: boolean, error?: string}}
 */
export function validateTwitterUrl(url) {
  if (typeof url !== 'string' || !url.trim()) {
    return {
      isValid: false,
      error: 'URL must be a non-empty string'
    };
  }

  // Twitter URL patterns
  const twitterPatterns = [
    /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i,
    /^https?:\/\/(mobile\.)?(twitter\.com|x\.com)\/\w+\/status\/\d+/i
  ];

  const isValid = twitterPatterns.some(pattern => pattern.test(url.trim()));

  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid Twitter URL. Please provide a valid Twitter/X post URL.'
    };
  }

  return { isValid: true };
}

