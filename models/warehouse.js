const mongoose = require('mongoose');

const WarehouseSchema = mongoose.Schema({
    warehouseName: { type: String, required: true },
    warehouseType: { 
        type: String, 
        required: true,
        enum: ["Warehouse", "Subwarehouse"] // Chỉ cho phép 2 giá trị này
    },
    address: { type: String, required: true },
    managerId: { type: String, required: true, ref: 'users'},
    listIngredient: [
        {
            ingredientId: {type: String, ref: 'ingredients'},
            quantity: Number
        }
    ]
}, { collection: 'warehouses', timestamps: true });

const Warehouse = mongoose.model('warehouses', WarehouseSchema);
module.exports = Warehouse;
