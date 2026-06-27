import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  updatePrivacySettingsSchema,
  userIdParamSchema,
  searchUserQuerySchema,
} from '../validations/user.validation.js';

const router = Router();

// Apply auth protection to all user routes
router.use(authenticate);

router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);
router.patch('/privacy', validate(updatePrivacySettingsSchema), userController.updatePrivacySettings);
router.get('/search', validate(searchUserQuerySchema, 'query'), userController.searchUsers);
router.get('/:id', validate(userIdParamSchema, 'params'), userController.getUserProfile);
router.post('/block/:id', validate(userIdParamSchema, 'params'), userController.blockUser);
router.delete('/block/:id', validate(userIdParamSchema, 'params'), userController.unblockUser);

export default router;
