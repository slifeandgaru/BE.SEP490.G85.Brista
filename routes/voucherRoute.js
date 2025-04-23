const express = require("express");
const router = express.Router();
const { createVoucher, deleteVoucher, getVoucherById, getVouchers, updateVoucher } = require("../controllers/voucherController");
const { checkLogin, checkAdmin } = require("../middlewares/auth");
const upload = require('../configs/multerConfig')

router.get("/get-all-voucher", getVouchers);
router.get("/get-voucher-by-id/:id", getVoucherById);
router.post("/create-new-voucher",checkLogin, createVoucher);
router.put("/update-voucher/:id",checkLogin, updateVoucher);
router.delete("/delete-voucher/:id",checkLogin, deleteVoucher);

module.exports = router;
