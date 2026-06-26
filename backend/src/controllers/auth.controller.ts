import { authService } from '../services/auth.service';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';

export const authController = {
  me: asyncHandler(async (req, res) => {
    if (!req.authUser) {
      throw new ApiError(401, 'Missing authenticated user');
    }

    res.json(authService.getMe(req.authUser));
  })
};
