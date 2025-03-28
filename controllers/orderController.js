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
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate("userId vatId voucherId product.productId");
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {
    try {
        const { userId, userName, product } = req.body;

        // 🔍 Tìm đơn hàng của khách hàng có status là "unpaid"
        let existingOrder = await Order.findOne({
            $or: [{ userId }, { userName }],
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
                userId,
                userName,
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
