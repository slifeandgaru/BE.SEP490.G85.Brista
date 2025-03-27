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
            },
        ],
    },
    { collection: "warehouses", timestamps: true }
);

const Warehouse = mongoose.model("Warehouse", WarehouseSchema);

module.exports = Warehouse;
