const { Category } = require("../models/category");

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

exports.getCategoryById = async (req, res) => {
    try {
        const { categoryId } = req.body; // Nhận ID từ body thay vì params
        if (!categoryId) {
            return res.status(400).json({ message: "Category ID is required" });
        }

        const category = await Category.findById(categoryId);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({ category });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}

exports.findCategoryRegex = async (req, res) => {
    try {
        const category = await Category.find({categoryName: {$regex: req.query.categoryName, $options: 'i'}});
        res.status(200).json({category});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

exports.changeCategoryName = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate({_id: req.body.categoryId}, {categoryName: req.body.categoryName}, {new: true, runValidators: true});
        res.status(200).json({category});
    } catch (error) {
        if(error.code === 11000) return res.status(400).json({message: 'this categoryName already in use'});
        res.status(500).json({message: 'server error', error});
    }
}