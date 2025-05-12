// models/KitchenTask.js
const mongoose = require('mongoose');

const kitchenTaskSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  brista: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  },
  productName: String,
  totalQuantity: Number,
  completedQuantity: {
    type: Number,
    default: 0
  },
  servedQuantity: {
    type: Number,
    default: 0
  },
  selectedOptions: {
    type: Map,
    of: String,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'done', 'in_progress'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('KitchenTask', kitchenTaskSchema);
