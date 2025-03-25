const Product = require('../models/product');

// [POST] Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

// [GET] Lấy danh sách sản phẩm (có phân trang)
exports.getAllProducts = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .populate('categoryId', 'categoryName')
            .populate('listIngredient.ingredientId', 'ingredientName unit')
            .populate('feedback.userId', 'username')
            .populate('coupon.couponId', 'couponCode discount')
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments();
        res.status(200).json({ total, page, limit, products });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving products', error });
    }
};

// [GET] Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
            .populate('categoryId', 'categoryName')
            .populate('listIngredient.ingredientId', 'ingredientName unit')
            .populate('feedback.userId', 'username')
            .populate('coupon.couponId', 'couponCode discount');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
};

// [PATCH] Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true }
        ).populate('categoryId', 'categoryName');

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

// [DELETE] Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};
