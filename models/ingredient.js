const mongoose = require("mongoose");

const IngredientSchema = new mongoose.Schema(
    {
        ingredientName: { type: String, required: true, trim: true },
        unit: { type: String, required: true, trim: true },
        ingredientCode: { type: String, required: true, unique: true, trim: true },
        batchCode: { type: String, required: true, unique: true, trim: true },
        expiration: { type: Date, required: true },
        conversionRate: { type: Number, default: 1 }, // Số đơn vị gốc / 1 đơn vị đóng gói
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
