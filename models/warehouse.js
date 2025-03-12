const mongoose = require('mongoose');

const WarehouseSchema = mongoose.Schema({
    warehouseName: { type: String, required: true },
    warehouseType: { 
        type: String, 
        required: true,
        enum: ["Warehouse", "Subwarehouse"] // Chỉ cho phép 2 giá trị này
    },
    address: { type: String, required: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'users'},
    listIngredient: [
        {
            ingredientId: {type: mongoose.Schema.Types.ObjectId, ref: 'ingredients'},
            quantity: Number
        }
    ]
}, { collection: 'warehouses', timestamps: true });

const Warehouse = mongoose.model('warehouses', WarehouseSchema);

module.exports.Warehouse = Warehouse;
