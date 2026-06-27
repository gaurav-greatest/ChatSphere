import { Router } from 'express';
import * as mediaController from '../controllers/media.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../middlewares/upload.middleware.js';

const router = Router();

// Protect all media routes
router.use(authenticate);

// Upload endpoint accepts file field
router.post('/upload', uploadFile.single('file'), mediaController.uploadMedia);

// Delete file endpoint
router.delete('/:id', mediaController.deleteMedia);

export default router;
