import express from 'express';
import { downloadVideo } from '../services/twitterService.js';
import { validateTwitterUrl } from '../utils/validation.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { url, quality } = req.query;

    if (!url) {
      return res.status(400).json({
        error: { message: 'URL is required' }
      });
    }

    // Validate Twitter URL
    const validationResult = validateTwitterUrl(url);
    if (!validationResult.isValid) {
      return res.status(400).json({
        error: { message: validationResult.error }
      });
    }

    // Download video
    await downloadVideo(url, quality, res);
  } catch (error) {
    next(error);
  }
});

export default router;

