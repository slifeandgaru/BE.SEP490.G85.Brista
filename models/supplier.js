const mongoose = require('mongoose');

const SupplierSchema = mongoose.Schema({
    supplierName: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    phone: { type: String, unique: true },
    email: { type: String, required: true, unique: true }
}, { collection: 'suppliers', timestamps: true });

const Supplier = mongoose.model('suppliers', SupplierSchema);

module.exports.Supplier = Supplier;
