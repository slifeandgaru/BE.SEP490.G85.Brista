const { Category } = require("../models/category");
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/uploads/category');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
      cb(null, file.fieldname + '-' + uniqueSuffix);
    }
})

exports.upload = multer({ storage: storage },{
    fileFilter: function(req, file, cb) {
        if(file.mimetype.includes('image')) return cb(null, true);
        
        cb(new Error('only accept image'));
    }
})

exports.adminCreateCategory = async (req, res) => {
    try {
        console.log("file recive: ", req.file)
        if (req.file) {
            req.body.thump = req.file.path; // Lấy link ảnh từ Cloudinary
        }
        const newCategory = await Category.create(req.body);
        res.status(200).json({ newCategory, message: 'Create category success' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Category already in use' });
        }
        res.status(500).json({ message: 'Server error', error });
    }
}

exports.getAllCategories = async (req, res) => {
    try {
        const listCategories = await Category.find();
        res.status(200).json({listCategories});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}