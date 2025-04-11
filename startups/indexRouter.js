// const testRoute = require('../routes/');
const router = require('express').Router();

const userRoute = require("../routes/userRoute")
const categoryRoute = require("../routes/categoryRoute")
const authRoute = require("../routes/authRoute")
const supplierRoute = require("../routes/supplierRoute")
const ingredientRoute = require("../routes/ingredientRoute")
const warehouseRoute = require("../routes/warehouseRoute")
const couponRoute = require("../routes/couponRoute")
const customerRoute = require("../routes/customerRoute")
const productRoute = require("../routes/productRoute")
const vatRoute = require("../routes/vatRoute")
const voucherRoute = require("../routes/voucherRoute")
const orderRoute = require("../routes/orderRoute")
const requestRoute = require("../routes/requestRoutes")
const transferRoute = require("../routes/transferRoutes")
const auditRoute = require("../routes/auditRoutes")

router.use('/auth', authRoute);

router.use('/user', userRoute);
router.use('/category', categoryRoute);
router.use('/supplier', supplierRoute);
router.use('/ingredient', ingredientRoute);
router.use('/warehouse', warehouseRoute);
router.use('/coupon', couponRoute);
router.use('/customer', customerRoute);
router.use('/product', productRoute);
router.use('/vat', vatRoute);
router.use('/voucher', voucherRoute);
router.use('/order', orderRoute);
router.use('/requests', requestRoute);
router.use('/transfers', transferRoute);
router.use('/audits', auditRoute);

module.exports = router;