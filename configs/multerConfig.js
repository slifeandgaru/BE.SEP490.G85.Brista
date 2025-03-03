const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinaryConfig'); // Import Cloudinary

// Cấu hình Multer để upload lên Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'categories', // Tạo thư mục trên Cloudinary
        format: async (req, file) => 'png', // Chuyển file sang PNG
        public_id: (req, file) => file.originalname.split('.')[0], // Đặt tên file
        transformation: [
            { width: 800, crop: "limit" } // Resize ảnh chiều rộng tối đa 800px
        ]
    },
});

const upload = multer({ storage });

module.exports = upload;
