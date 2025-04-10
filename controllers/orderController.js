const mongoose = require('mongoose');
const Order = require("../models/order");
const Product = require("../models/product");

// Lấy danh sách tất cả đơn hàng
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("userId vatId voucherId product.productId");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đơn hàng theo ID
exports.getOrderByPhone = async (req, res) => {
    try {
        const phone = req.params.phone;
        const orders = await Order.find({ phone, status: "unpaid" })
            .populate("userId vatId voucherId product.productId");

        if (orders.length === 0) {
            return res.status(200).json({ message: "Không tìm thấy đơn hàng nào chưa thanh toán với số điện thoại này." });
        }

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error finding order by phone:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    try {
        const { userId, userName, product, phone } = req.body;

        // 🔍 Tìm đơn hàng của khách hàng có status là "unpaid"
        let existingOrder = await Order.findOne({
            $or: [{ userId }, { phone }],
            status: "unpaid"
        });

        if (existingOrder) {
            // ✅ Nếu đơn hàng đã tồn tại, cập nhật danh sách sản phẩm
            product.forEach((newProduct) => {
                const existingProduct = existingOrder.product.find(p =>
                    p.productId.toString() === newProduct.productId
                );

                if (existingProduct) {
                    // Nếu sản phẩm đã có, cộng dồn quantity
                    existingProduct.quantity += newProduct.quantity;
                } else {
                    // Nếu chưa có, thêm mới vào danh sách
                    existingOrder.product.push(newProduct);
                }
            });

        } else {
            // ❌ Nếu chưa có đơn hàng, tạo mới
            existingOrder = new Order({
                phone,
                userId,
                product,
                status: "unpaid",
                orderDate: new Date()
            });
        }

        // 📌 Lấy danh sách productId để truy vấn giá sản phẩm
        const productIds = existingOrder.product.map(p => p.productId);
        const productsInDB = await Product.find({ _id: { $in: productIds } });

        // 🎯 Cập nhật tổng tiền (total = sum(quantity * price))
        existingOrder.total = existingOrder.product.reduce((total, p) => {
            const productInfo = productsInDB.find(prod => prod._id.toString() === p.productId.toString());
            return total + (productInfo ? productInfo.price * p.quantity : 0);
        }, 0);

        // 💾 Lưu lại đơn hàng
        const savedOrder = await existingOrder.save();
        res.status(201).json(savedOrder);

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật đơn hàng
exports.updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Lấy order bằng customer id
exports.getOrdersByCustomerId = async (req, res) => {
    try {
        // Chuyển customerId từ string -> ObjectId
        const customerId = req.params.id;
        console.log(customerId)

        // Tìm tất cả đơn hàng của khách hàng
        const orders = await Order.find({ customerId })
            .populate("userId vatId voucherId product.productId");

        if (!orders.length) return res.status(404).json({ message: "No orders found for this customer" });

        res.status(200).json(orders);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Server error" });
    }
};
