const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    userName: {type: String, require: true},
    product: [{
        productId: {type: mongoose.Schema.Types.ObjectId, ref: 'products'},
        quantity: Number,
    }],
    total: Number,
    phone: {type: String},
    address: String,
    table: Number,
    status: {type: String, enum: ['paid', 'unpaid', 'doing', 'done', 'served'], default: 'unpaid'},
},{collection: 'orders', timestamps: true});

const Order = mongoose.model('orders', OrderSchema);

module.exports = Order;