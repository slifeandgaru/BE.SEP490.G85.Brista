const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    userName: String,
    product: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'products'},
        quantity: Number,
    }],
    total: Number,
    phone: String,
    address: String,
    table: Number,
    status: {type: String, enum: ['paid', 'unpaid', 'doing', 'done', 'served'], default: 'unpaid'},
    orderDate: Date,
    vatId: {type: mongoose.Schema.Types.ObjectId, ref: 'VATs'},
    voucherId: {type: mongoose.Schema.Types.ObjectId, ref: 'Vouchers'},
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "warehouses" }
},{collection: 'orders', timestamps: true});

const Order = mongoose.model('orders', OrderSchema);

module.exports = Order