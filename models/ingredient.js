const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema(
    {
        ingredientName: { type: String, required: true, trim: true },
        baseUnit: { type: String, required: true, trim: true }, // Đổi tên từ unit thành baseUnit
        ingredientCode: { type: String, required: true, unique: true, trim: true },
        batchCode: { type: String, required: true, unique: true, trim: true },
        expiration: { type: Date, required: true },

        conversionRate: [
            {
                unit: { type: String, trim: true },
                rate: { type: Number }, // Số đơn vị baseUnit / 1 đơn vị này
            }
        ],

        thump: {
            type: String,
            default: "https://cdn-icons-png.flaticon.com/512/1261/1261163.png",
            trim: true,
        },
    },
    { collection: "ingredients", timestamps: true }
);

const Ingredient = mongoose.model("ingredients", IngredientSchema);

module.exports = Ingredient;
