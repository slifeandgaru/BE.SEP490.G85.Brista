const mongoose = require('mongoose');
const Order = require("../models/order");
const Product = require("../models/product");

const Warehouse = require("../models/warehouse");
const Ingredient = require("../models/ingredient");

// Lấy danh sách tất cả đơn hàng
// exports.getOrders = async (req, res) => {
//     try {
//         const orders = await Order.find().populate("userId vatId voucherId product.productId");
//         res.status(200).json(orders);
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

exports.getOrders = async (req, res) => {
    try {
        const { search = "", status, page = 1, limit = 5 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (search) query.phone = { $regex: search, $options: "i" };

        const orders = await Order.find(query)
            .populate("product.productId")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Order.countDocuments(query);

        res.status(200).json({ orders, total });
    } catch (err) {
        console.error("getAllOrders error:", err);
        res.status(500).json({ message: "Server error" });
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
        const { userId, userName, product, phone, address, table, warehouseId } = req.body;

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
                orderDate: new Date(),
                table,
                address,
                warehouseId
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

exports.updateOrderPaid = async (req, res) => {
    try {
        const prevOrder = await Order.findById(req.params.id);

        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate({
            path: "product.productId",
            populate: { path: "listIngredient.ingredientId" }
        });

        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

        // Trừ nguyên liệu khi chuyển sang trạng thái paid
        if (req.body.status === "paid" && prevOrder.status !== "paid") {
            const warehouse = await Warehouse.findById(updatedOrder.warehouseId);
            if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

            for (const item of updatedOrder.product) {
                const product = item.productId;
                const quantityOrdered = item.quantity;

                for (const ing of product.listIngredient) {
                    const ingredientId = ing.ingredientId._id;
                    const baseQtyNeeded = ing.quantity * quantityOrdered;
                    const baseUnit = ing.ingredientId.baseUnit;

                    const index = warehouse.listIngredient.findIndex(
                        (ingItem) => ingItem.ingredientId.toString() === ingredientId.toString()
                    );

                    if (index === -1) {
                        return res.status(400).json({ message: `Nguyên liệu không tồn tại trong kho: ${ing.ingredientId.ingredientName}` });
                    }

                    const stockItem = warehouse.listIngredient[index];
                    const warehouseUnit = stockItem.unit;
                    let currentQtyInBase = stockItem.quantity;

                    if (warehouseUnit !== baseUnit) {
                        const conv = ing.ingredientId.conversionRate.find(c => c.unit === warehouseUnit);
                        if (!conv) {
                            return res.status(400).json({ message: `Không tìm thấy conversionRate cho ${warehouseUnit} -> ${baseUnit}` });
                        }
                        currentQtyInBase = stockItem.quantity * conv.rate;
                    }

                    if (currentQtyInBase < baseQtyNeeded) {
                        return res.status(400).json({
                            message: `Không đủ nguyên liệu "${ing.ingredientId.ingredientName}" trong kho "${warehouse.warehouseName}"`
                        });
                    }

                    // Trừ nguyên liệu theo đơn vị trong kho
                    let qtyToSubtractInWarehouseUnit = baseQtyNeeded;

                    if (warehouseUnit !== baseUnit) {
                        const conv = ing.ingredientId.conversionRate.find(c => c.unit === warehouseUnit);
                        qtyToSubtractInWarehouseUnit = baseQtyNeeded / conv.rate;
                    }

                    warehouse.listIngredient[index].quantity -= qtyToSubtractInWarehouseUnit;
                }
            }

            await warehouse.save();
        }

        // ⚡ Emit socket cho client biết đơn hàng đã cập nhật (trạng thái mới, trừ kho xong)
        if (global._io) {
            global._io.emit("update_order_paid", updatedOrder);
        }

        return res.status(200).json(updatedOrder);
    } catch (error) {
        return res.status(400).json({ message: error.message });
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
