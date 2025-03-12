const express = require('express');
const { checkLogin, checkAdmin } = require('../middlewares/auth');
const {
    createCoupon,
    getAllCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');

const router = express.Router();

router.post('/create-new-coupon', createCoupon); // Tạo coupon mới
router.get('/get-all-coupon', getAllCoupons); // Lấy danh sách coupon (hỗ trợ phân trang)
router.get('/get-coupon-by-id/:couponId', checkLogin, getCouponById); // Lấy coupon theo ID
router.patch('/update-coupon/:couponId', checkLogin, updateCoupon); // Cập nhật coupon theo ID
router.delete('/delete-coupon/:couponId', checkLogin, deleteCoupon); // Xóa coupon theo ID

module.exports = router;
