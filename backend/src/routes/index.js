import express from 'express';
import extractRoutes from './extract.js';
import downloadRoutes from './download.js';

const router = express.Router();

router.use('/extract', extractRoutes);
router.use('/download', downloadRoutes);

export default router;

