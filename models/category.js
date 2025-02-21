const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
    categoryName: {type: String, unique: true, required: true},	
    thump: {type: String, default: 'https://cdn0.iconfinder.com/data/icons/infographic-orchid-vol-1/256/Colorful_Label-512.png'},
    enable: {type: Boolean, default: true}
},{collection: 'categories', timestamps: true});

const Category = mongoose.model('categories', CategorySchema);
	
module.exports.Category = Category;