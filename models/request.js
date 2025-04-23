// models/Request.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const RequestSchema = new mongoose.Schema({
    fromWarehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses',
        required: true,
    },
    toWarehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'warehouses',
        required: true,
    },
    requestedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'users'},
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'delivered'],
        default: 'pending',
    },
    items: [
        {
            ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredients' },
            quantityRequested: { type: Number, required: true },
            unit: { type: String },
        },
    ],
}, { timestamps: true });

module.exports = mongoose.model('Request', RequestSchema);


