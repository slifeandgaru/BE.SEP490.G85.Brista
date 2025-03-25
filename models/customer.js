const mongoose = require('mongoose');

const CustomerSchema = mongoose.Schema({
    
    customerName: { type: String, required: true },
    phone: { type: String, required: true },

}, { collection: 'customers', timestamps: true });

const Customer = mongoose.model('customers', CustomerSchema);

module.exports.Customer = Customer;
