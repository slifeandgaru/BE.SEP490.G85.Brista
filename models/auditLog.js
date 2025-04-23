const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuditLogSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouses', required: true },
    ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredients', required: true },
    action: {
      type: String,
      enum: ['import', 'export', 'adjustment', 'transfer-in', 'transfer-out'],
      required: true,
    },
    quantityChanged: { type: Number, required: true },
    changedBy: { type: String, required: true },
    note: { type: String },
    createdAt: { type: Date, default: Date.now },
  });
  
  module.exports = mongoose.model('AuditLog', AuditLogSchema);