const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig');

// Cấu hình lưu trữ trên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Thư mục lưu ảnh trên Cloudinary
    format: async (req, file) => 'png', // Chuyển đổi ảnh sang PNG
    public_id: (req, file) => file.originalname.split('.')[0], // Tên file
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
