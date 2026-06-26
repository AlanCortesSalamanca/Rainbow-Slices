import { uploadsService } from '../services/uploads.service';
import { asyncHandler } from '../utils/asyncHandler';

export const uploadsController = {
  productImage: asyncHandler(async (req, res) => {
    const publicUrl = await uploadsService.uploadProductImage(req.file);
    res.status(201).json({ imageUrl: publicUrl });
  })
};
