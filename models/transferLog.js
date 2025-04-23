// models/Transfer.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TransferLogSchema = new mongoose.Schema({
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'requests', required: true },
    fromWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouses', required: true },
    toWarehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouses', required: true },
    deliveredBy: { type: String, required: true },
    deliveredAt: { type: Date, default: Date.now },
    note: { type: String },
    items: [
        {
            ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredients' },
            quantityRequested: { type: Number, required: true },
            unit: {type: String }
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('TransferLog', TransferLogSchema);
