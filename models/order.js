const mongoose = require('mongoose');

const OrderSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
    userName: String,
    product: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
        quantity: Number,
        selectedOptions: {
            type: Map,
            of: String // ví dụ: { Size: 'M', Ice: 'None', Sugar: '100%' }
        },
        served: Number
    }],
    total: Number,
    phone: String,
    address: String,
    table: Number,
    status: { type: String, enum: ['paid', 'unpaid', 'doing', 'done', 'served'], default: 'unpaid' },
    vatId: { type: mongoose.Schema.Types.ObjectId, ref: 'VATs' },
    voucherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vouchers' },
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: "warehouses" },
}, { collection: 'orders', timestamps: true });

const Order = mongoose.model('orders', OrderSchema);

module.exports = Order