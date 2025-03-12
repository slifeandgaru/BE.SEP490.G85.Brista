const mongoose = require('mongoose');

const IngredientSchema = mongoose.Schema({
    ingredientName: { type: String, required: true },
    unit: { type: String, required: true },
    ingredientCode: { type: String, required: true },
    batchCode: { type: String, required: true },
    expiration: { type: Date, required: true },
    thump: { 
        type: String, 
        default: 'https://cdn-icons-png.flaticon.com/512/1261/1261163.png' 
    },

}, { collection: 'ingredients', timestamps: true });

const Ingredient = mongoose.model('ingredients', IngredientSchema);
module.exports = Ingredient;
