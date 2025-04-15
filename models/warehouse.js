const mongoose = require("mongoose");

const WarehouseSchema = new mongoose.Schema(
    {
        warehouseName: { type: String, required: true, trim: true },
        warehouseType: {
            type: String,
            required: true,
            enum: ["Warehouse", "Subwarehouse"],
        },
        address: { type: String, required: true, trim: true },
        managerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "users" },
        listIngredient: [
            {
                ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: "ingredients" },
                quantity: { type: Number, required: true }, // Tổng số lượng theo đơn vị gốc
                unit: { type: String, trim: true }
            },
        ],
    },
    { collection: "warehouses", timestamps: true }
);

const Warehouse = mongoose.model("warehouses", WarehouseSchema);

module.exports = Warehouse;
