const Coupon = require('../models/coupon');

// Tạo mã giảm giá mới
exports.createCoupon = async (req, res) => {
    try {
        const { couponCode, discount, discountType, expiration } = req.body;

        // Kiểm tra xem coupon đã tồn tại chưa
        const existingCoupon = await Coupon.findOne({ couponCode });
        if (existingCoupon) {
            return res.status(400).json({ message: "Coupon code already exists!" });
        }

        const newCoupon = new Coupon({ couponCode, discount, discountType, expiration });
        await newCoupon.save();

        res.status(201).json({ message: "Coupon created successfully!", coupon: newCoupon });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Lấy danh sách tất cả coupon (hỗ trợ phân trang)
exports.getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const coupons = await Coupon.find()
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.status(200).json({ total: coupons.length, coupons });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Lấy thông tin coupon theo ID
exports.getCouponById = async (req, res) => {
    try {
        const coupon = await Coupon.findById(req.params.couponId);
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }
        res.status(200).json({ coupon });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Cập nhật coupon theo ID
exports.updateCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, req.body, { new: true });

        if (!updatedCoupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({ message: "Coupon updated successfully", coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Xóa coupon theo ID
exports.deleteCoupon = async (req, res) => {
    try {
        const { couponId } = req.params;
        const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

        if (!deletedCoupon) {
            return res.status(404).json({ message: "Coupon not found" });
        }

        res.status(200).json({ message: "Coupon deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
