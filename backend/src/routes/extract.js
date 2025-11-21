import express from 'express';
import { extractVideoInfo } from '../services/twitterService.js';
import { validateTwitterUrl } from '../utils/validation.js';

const router = express.Router();

router.post('/', async (req, res, next) => {
  try {
    const { url } = req.body;

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

    // Extract video info
    const videoInfo = await extractVideoInfo(url);

    res.json({
      success: true,
      data: videoInfo
    });
  } catch (error) {
    next(error);
  }
});

export default router;

