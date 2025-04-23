const mongoose = require("mongoose");

const VoucherSchema = new mongoose.Schema({
    voucherCode: { type: String, required: true, unique: true },
    description: { type: String },
    discount_type: {
        type: String,
        required: true,
        enum: ["percent", "fixed"]
    },
    discount_value: {
        type: Number,
        required: true,
        validate: {
            validator: function (value) {
                if (this.discount_type === "percent") {
                    return value >= 0 && value <= 100;
                }
                return true; // Nếu là "fixed", không cần kiểm tra
            },
            message: "Nếu discount_type là 'percent', discount_value phải từ 0 đến 100."
        }
    },
    min_order_value: Number ,
    max_discount: Number ,
    usage_limit: { type: Number, required: true },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    status: { type: String, required: true, enum: ["active", "inactive"] },
    created_at: { type: Date, default: Date.now }
}, { collection: 'Vouchers', timestamps: true });

module.exports = mongoose.model("Vouchers", VoucherSchema);

