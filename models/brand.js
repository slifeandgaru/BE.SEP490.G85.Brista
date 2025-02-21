const mongoose = require('mongoose');

const BrandSchema = mongoose.Schema({
    brandName: {type: String, required: true, unique: true},
    info: [{
        key: String,
        value: String
    }],
    thump: {type: String, default: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkMbxy2YUDO5ycdm9Eb8thEPQ03McHIxETGA&usqp=CAU'}
}, {timestamps: true, collection: 'brands'});

const Brand = mongoose.model('brands', BrandSchema);

module.exports.Brand = Brand;