const mongoose = require("mongoose");

const WarehouseProductSchema = new mongoose.Schema({
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouses', required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true },
}, { timestamps: true, collection: 'warehouse_products' });

const WarehouseProduct = mongoose.model("WarehouseProduct", WarehouseProductSchema);

module.exports = WarehouseProduct;
