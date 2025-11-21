// Debug script for video extraction
// Run with: node debug-video-extraction.js <twitter-url>

import axios from 'axios';

const twitterUrl = process.argv[2];

if (!twitterUrl) {
  console.error('Usage: node debug-video-extraction.js <twitter-url>');
  process.exit(1);
}

console.log('Testing video extraction for:', twitterUrl);
console.log('');

// Test backend extract endpoint
async function testExtract() {
  try {
    console.log('[1] Testing extract endpoint...');
    const response = await axios.post('http://localhost:3001/api/extract', {
      url: twitterUrl
    }, {
      timeout: 30000
    });

    console.log('✓ Extract successful');
    console.log('Tweet ID:', response.data.data.tweetId);
    console.log('Title:', response.data.data.title);
    console.log('Author:', response.data.data.author);
    console.log('Formats found:', response.data.data.formats?.length || 0);
    
    if (response.data.data.formats && response.data.data.formats.length > 0) {
      console.log('\nVideo formats:');
      response.data.data.formats.forEach((format, index) => {
        console.log(`  [${index + 1}] ${format.quality || 'unknown'}: ${format.url}`);
      });
    }

    return response.data.data;
  } catch (error) {
    console.error('✗ Extract failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

// Test download endpoint
async function testDownload(videoInfo) {
  try {
    console.log('\n[2] Testing download endpoint...');
    const downloadUrl = `http://localhost:3001/api/download?url=${encodeURIComponent(twitterUrl)}`;
    
    const response = await axios.get(downloadUrl, {
      responseType: 'stream',
      timeout: 30000,
      validateStatus: (status) => status < 500 // Accept 404 as valid response
    });

    if (response.status === 200) {
      console.log('✓ Download endpoint working');
      console.log('Content-Type:', response.headers['content-type']);
      console.log('Content-Length:', response.headers['content-length']);
    } else if (response.status === 404) {
      console.log('⚠ Download returned 404 - video URL not found');
      console.log('This might mean the video extraction needs improvement');
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('⚠ Download returned 404 - video URL not found');
    } else {
      console.error('✗ Download test failed:', error.message);
    }
  }
}

// Main
(async () => {
  try {
    const videoInfo = await testExtract();
    await testDownload(videoInfo);
  } catch (error) {
    console.error('\nTest failed:', error.message);
    process.exit(1);
  }
})();

