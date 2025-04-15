const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    productName: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'categories', required: true },
    thump: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/1261/1261163.png' },
    listIngredient: [
        {
            ingredientId: { type: mongoose.Schema.Types.ObjectId, ref: 'ingredients' },
            quantity: { type: Number, required: true },
            unit: {type: String}
        }
    ],
    price: { type: Number, required: true },
    totalStorage: { type: Number, required: true },
    expiration: Date,
    feedback: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
            rating: { type: Number, min: 1, max: 5 },
            comment: { type: String }
        }
    ],
    coupon: [{
        couponId: { type: mongoose.Schema.Types.ObjectId, ref: 'coupons' }
    }]
}, { collection: 'products', timestamps: true });

const Product = mongoose.model('products', ProductSchema);
module.exports = Product;
