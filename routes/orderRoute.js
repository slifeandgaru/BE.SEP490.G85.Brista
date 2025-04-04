const express = require("express");
const router = express.Router();
const { getOrders, getOrderByPhone, createOrder, updateOrder, deleteOrder } = require("../controllers/orderController");
const { checkLogin, checkAdmin } = require("../middlewares/auth");

router.get("/get-all-orders", getOrders);
router.get("/get-order-by-phone/:phone", getOrderByPhone);
router.post("/create-new-order", createOrder);
router.put("/update-order/:id", checkLogin, updateOrder);
router.delete("/delete-order/:id", checkLogin, deleteOrder);

module.exports = router;
