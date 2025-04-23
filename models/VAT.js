const mongoose = require('mongoose');

const vatSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String },
    rate: {
        type: Number,
        required: true,
        min: [0, "Rate must be at least 0%"],
        max: [100, "Rate must be at most 100%"]
    },
    status: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
}, { collection: 'VATs', timestamps: true });

module.exports = mongoose.model('VATs', vatSchema);
