const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true, unique: true },
    discount: { type: Number, required: true }, // Số tiền hoặc % giảm giá
    discountType: { type: String, required: true, enum: ["percentage", "fixed"] }, // "percentage" hoặc "fixed"
    expiration: { type: Date, required: true } // Ngày hết hạn
}, { collection: 'coupons', timestamps: true });

const Coupon = mongoose.model('Coupons', CouponSchema);
module.exports = Coupon;