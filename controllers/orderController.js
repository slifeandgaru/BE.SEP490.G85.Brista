const mongoose = require('mongoose');
const Order = require("../models/order");
const Product = require("../models/product");

const Warehouse = require("../models/warehouse");
const Ingredient = require("../models/ingredient");
const { client } = require("../services/paypalClient")
const paypal = require("@paypal/checkout-server-sdk");
const moment = require('moment');

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
        const { search = "", status, page = 1, limit = 5, startDate, endDate } = req.query;
        console.log(startDate + "---" + endDate)
        const query = {};


        if (status) query.status = status;
        if (search) query.phone = { $regex: search, $options: "i" };

        // 🎯 Lọc theo createdAt nếu có ngày
        if (startDate && endDate) {
            query.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)) // kết thúc ngày
            };
        }

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

// Lấy đơn hàng đã thanh toán theo bàn
exports.getOrderPaidByTable = async (req, res) => {
    try {
        const table = req.params.table;
        const orders = await Order.find({ table, status: "paid" })
            .populate("userId vatId voucherId product.productId");

        if (orders.length === 0) {
            return res.status(200).json({ message: "Bàn đang trống." });
        }

        res.status(200).json(orders);
    } catch (error) {
        // console.error("Error finding order by phone:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Tạo đơn hàng mới
exports.createOrder = async (req, res) => {

    try {
        const { userId, userName, product, phone, address, table, warehouseId } = req.body;

        // 🔍 Tìm đơn hàng của khách hàng có status là "unpaid"
        console.log(66, phone);
        let existingOrder = await Order.findOne({
            phone,
            status: "unpaid"
        });
        console.log(66, existingOrder);

        if (existingOrder) {
            // ✅ Nếu đơn hàng đã tồn tại, cập nhật danh sách sản phẩm
            product.forEach((newProduct) => {
                const existingProduct = existingOrder.product.find(p =>
                    p.productId.toString() === newProduct.productId &&
                    JSON.stringify(p.selectedOptions) === JSON.stringify(newProduct.selectedOptions)
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
                table,
                address,
                warehouseId,
            });
        }

        // 📌 Lấy danh sách productId để truy vấn giá sản phẩm
        const productIds = existingOrder.product.map(p => p.productId);
        const productsInDB = await Product.find({ _id: { $in: productIds } });

        // 🎯 Cập nhật tổng tiền (tính thêm phụ phí Size nếu có)
        existingOrder.total = existingOrder.product.reduce((total, p) => {
            const productInfo = productsInDB.find(prod => prod._id.toString() === p.productId.toString());
            if (!productInfo) return total;

            let price = productInfo.price;

            const size = p.selectedOptions?.get
                ? p.selectedOptions.get('Size') // nếu là Map
                : p.selectedOptions?.Size;      // nếu là Object

            if (size === 'M') {
                price += price * 0.1;
            } else if (size === 'L') {
                price += price * 0.2;
            }

            return total + price * p.quantity;
        }, 0);

        // 💾 Lưu lại đơn hàng
        const savedOrder = await existingOrder.save();
        res.status(201).json(savedOrder);

    } catch (error) {
        console.error("❌ Error in createOrder:", error);
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật đơn hàng
exports.updateOrder = async (req, res) => {
    try {
        const orderId = req.params.id;
        const updateData = req.body;

        // Nếu có cập nhật danh sách sản phẩm thì cần tính lại `total`
        if (updateData.product) {
            // Lấy danh sách productId từ danh sách mới
            const productIds = updateData.product.map(p => p.productId);
            const productsInDB = await Product.find({ _id: { $in: productIds } });
            // console.log(productsInDB[0]._id.toString())

            // Tính lại tổng tiền
            updateData.total = updateData.product.reduce((total, p) => {
                const productInfo = productsInDB.find(prod => prod._id.toString() === p.productId._id.toString());
                if (!productInfo) return total;

                let price = productInfo.price;
                const size = p.selectedOptions?.get
                    ? p.selectedOptions.get('Size') // Nếu là Map
                    : p.selectedOptions?.Size;     // Nếu là Object

                if (size === 'M') {
                    price += price * 0.1;
                } else if (size === 'L') {
                    price += price * 0.2;
                }

                return total + price * p.quantity;
            }, 0);
        }

        // Cập nhật đơn hàng
        const updatedOrder = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });

        res.status(200).json(updatedOrder);

        // Gửi socket cập nhật nếu có
        if (global._io && updatedOrder.phone) {
            global._io.to(updatedOrder.phone).emit("update_quantity", updatedOrder);
        }

    } catch (error) {
        console.error("❌ Error in updateOrder:", error);
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

// DELETE /api/order/remove-product
exports.removeProductFromOrder = async (req, res) => {
    try {
        const { phone, productItemId } = req.body; // productItemId là _id của từng item trong mảng product

        const updatedOrder = await Order.findOneAndUpdate(
            { phone, status: "unpaid" },
            { $pull: { product: { _id: productItemId } } },
            { new: true }
        );

        console.log(updatedOrder)

        if (!updatedOrder) {
            return res.status(404).json({ message: "Order not found" });
        }

        // 👉 Cập nhật lại tổng tiền (sau khi đã remove)
        const productIds = updatedOrder.product.map(p => p.productId);
        const productsInDB = await Product.find({ _id: { $in: productIds } });

        updatedOrder.total = updatedOrder.product.reduce((total, p) => {
            const productInfo = productsInDB.find(prod => prod._id.toString() === p.productId.toString());
            return total + (productInfo ? productInfo.price * p.quantity : 0);
        }, 0);

        await updatedOrder.save();

        res.json({ message: "Product removed", order: updatedOrder });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.demoPaypal = async (req, res) => {
    const { amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "USD",
                    value: amount,
                },
            },
        ],
    });

    try {
        const response = await client().execute(request);
        res.json({ id: response.result.id, links: response.result.links });
    } catch (err) {
        console.error("PayPal create order error:", err);
        res.status(500).json({ error: err.message });
    }

    // const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    // request.prefer("return=representation");
    // request.requestBody({
    //     intent: "CAPTURE",
    //     purchase_units: [{
    //         amount: { currency_code: "USD", value: amount }
    //     }],
    //     application_context: {
    //         return_url: "http://localhost:3000/payment-success",
    //         cancel_url: "http://localhost:3000/payment-cancel"
    //     }
    // });

    // try {
    //     const order = await client().execute(request);
    //     const approvalUrl = order.result.links.find(link => link.rel === "approve").href;
    //     res.json({ approvalUrl });
    // } catch (err) {
    //     console.error(err);
    //     res.status(500).json({ error: "Không tạo được order" });
    // }
}

exports.updateServedByProductItemId = async (req, res) => {
    const { phone, updates, orderId } = req.body;

    try {
        const orders = await Order.find({ phone });

        if (!orders.length) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng với số điện thoại này.' });
        }

        let overServedItems = []; // lưu danh sách sản phẩm vượt quá

        for (const order of orders) {
            let updated = false;

            for (const product of order.product) {
                const match = updates.find(u => u.productItemId === product._id.toString());

                if (match) {
                    // Nếu served chưa được khởi tạo, thì gán = 0
                    if (typeof product.served !== 'number') {
                        product.served = 0;
                    }
                    const newServed = product.served + match.served;

                    if (newServed === product.quantity) {
                        const updateStatus = await Order.findByIdAndUpdate(orderId, { status: 'served' })
                    }
                    if (newServed > product.quantity) {
                        overServedItems.push({
                            productItemId: product._id,
                            productId: product.productId,
                            message: 'Số lượng phục vụ vượt quá số lượng đã đặt.',
                            served: product.served,
                            quantity: product.quantity,
                            remaining: product.quantity - product.served,
                        });
                    } else {
                        product.served = newServed;
                        updated = true;
                    }
                }
            }

            if (updated) {
                await order.save();
            }
        }

        if (overServedItems.length > 0) {
            return res.status(400).json({
                message: 'Một số sản phẩm vượt quá số lượng cho phép.',
                overServedItems,
            });
        }

        res.json({ message: 'Cập nhật served thành công.' });
    } catch (error) {
        console.error('Lỗi khi cập nhật served:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật served.' });
    }
};

exports.getRevenueStats = async (req, res) => {
    try {
        const { type } = req.query;
        let matchCondition = { status: 'paid' };
        let groupFormat = '%Y-%m-%d'; // Nhóm theo ngày
        let startDate, endDate;

        const today = moment().startOf('day');

        switch (type) {
            case 'today':
                startDate = today.toDate();
                endDate = moment(today).endOf('day').toDate();
                break;
            case 'yesterday':
                startDate = moment(today).subtract(1, 'day').startOf('day').toDate();
                endDate = moment(today).subtract(1, 'day').endOf('day').toDate();
                break;
            case 'last7days':
                startDate = moment(today).subtract(6, 'days').startOf('day').toDate();
                endDate = moment(today).endOf('day').toDate();
                break;
            case 'thisMonth':
                startDate = moment().startOf('month').toDate();
                endDate = moment().endOf('month').toDate();
                break;
            case 'lastMonth':
                startDate = moment().subtract(1, 'month').startOf('month').toDate();
                endDate = moment().subtract(1, 'month').endOf('month').toDate();
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid type' });
        }

        matchCondition.createdAt = { $gte: startDate, $lte: endDate };

        const revenue = await Order.aggregate([
            { $match: matchCondition },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                    value: { $sum: '$total' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Format lại để trả ra { name: 'dd/mm', value }:
        const formatted = revenue.map(item => ({
            name: moment(item._id, 'YYYY-MM-DD').format('DD/MM'),
            value: item.value
        }));

        return res.json({ success: true, data: formatted });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getTopProductsOfMonth = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const topProducts = await Order.aggregate([
      {
        $match: {
          status: 'paid',
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: 'products',
          localField: 'product.productId',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: "$productInfo" },
      {
        $group: {
          _id: "$product.productId",
          name: { $first: "$productInfo.productName" },
          totalQuantity: { $sum: "$product.quantity" },
          totalRevenue: {
            $sum: {
              $multiply: ["$product.quantity", "$productInfo.price"]
            }
          }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          name: 1,
          totalRevenue: 1
        }
      }
    ]);

    res.status(200).json({ success: true, data: topProducts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

