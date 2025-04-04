const express = require("express");
const router = express.Router();
<<<<<<< HEAD
const { getOrders, getOrderByPhone, createOrder, updateOrder, deleteOrder } = require("../controllers/orderController");
const { checkLogin, checkAdmin } = require("../middlewares/auth");

router.get("/get-all-orders", getOrders);
router.get("/get-order-by-phone/:phone", getOrderByPhone);
=======
const { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrdersByCustomerId } = require("../controllers/orderController");
const { checkLogin, checkAdmin } = require("../middlewares/auth");

router.get("/get-all-orders", getOrders);
router.get("/get-order-by-id/:id", getOrderById);
router.get("/get-order-by-customerId/:id", getOrdersByCustomerId);
>>>>>>> e90fae2ef12447826747aeba5f86030e04dd7d69
router.post("/create-new-order", createOrder);
router.put("/update-order/:id", checkLogin, updateOrder);
router.delete("/delete-order/:id", checkLogin, deleteOrder);

module.exports = router;
