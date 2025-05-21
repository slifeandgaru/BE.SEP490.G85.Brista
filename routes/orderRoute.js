const express = require("express");
const router = express.Router();
const {
    getOrders,
    getOrderByPhone,
    createOrder,
    updateOrder,
    deleteOrder,
    updateOrderPaid,
    removeProductFromOrder,
    demoPaypal,
    getOrderPaidByTable,
    updateServedByProductItemId
} = require("../controllers/orderController");
const { checkLogin, checkAdmin } = require("../middlewares/auth");

router.get("/get-all-orders", getOrders);
router.get("/get-order-by-phone/:phone", getOrderByPhone);
router.get("/get-order-by-table/:table", getOrderPaidByTable);
router.post("/create-new-order", createOrder);
router.post("/served-order", updateServedByProductItemId);
router.post("/demoPaypal", demoPaypal);
router.put("/update-order/:id", updateOrder);
router.put("/update-order-paid/:id", updateOrderPaid);
router.delete("/delete-order/:id", checkLogin, deleteOrder);
router.delete("/remove-product-from-order", removeProductFromOrder);

module.exports = router;
