const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: any, file: Express.Multer.File, cb: any) => {
    cb(null, uploadsDir);
  },
  filename: (req: any, file: Express.Multer.File, cb: any) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, baseName + '-' + uniqueSuffix + extension);
  }
});

const fileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Limit to 1 file per request
  }
});

// Single file upload middleware
export const uploadSingle = upload.single('image');

// Multiple files upload middleware (max 5 files)
export const uploadMultiple = upload.array('images', 5);

// Specific field upload middleware
export const uploadFields = upload.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'documents', maxCount: 3 }
]);