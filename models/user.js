const mongoose = require("../configs/connectDB")
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyOTP } = require("../services/otpStore");

const UserSchema = mongoose.Schema({
    password: String,
    email: {
        type: String,
        sparse: true,
        unique: true,
        trim: true,
        maxlength: [100, 'Your email is too long'],
        // required: [true, 'Please choose an email'],
        dropDups: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    avatar: { type: String, default: 'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg' },
    phone: { type: String, unique: true, dropDups: true },
    address: [],
    role: { type: String, enum: ['admin', 'cashier', 'waiter', 'brista', 'taker_order', 'manager', 'warehouse', 'guest' ], default: 'guest' },
    token: String,
    fullname: String,
    dateOfBirth: Date,
    sex: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    nationality: { type: String, default: 'Viet Nam' },
    active: { type: Boolean, default: true },
    verifyOTP: { type: String },
    otpExpiration: { type: String } ,
    warehouseId: { type: mongoose.Schema.Types.ObjectId, ref: 'warehouses' },
}, { collection: 'users', timestamps: true });

UserSchema.pre('updateOne', async function (next) {
    if (!this._update.password) return next();

    const salt = await bcrypt.genSalt(10);
    this._update.password = await bcrypt.hash(this._update.password, salt);
});

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.verifyPassword = async function (inputPassword) {
    console.log(this.password)
    return await bcrypt.compare(inputPassword, this.password);
}

UserSchema.methods.createToken = function () {
    const payload = {
        id: this._id,
        avatar: this.avatar,
        username: this.username,
        email: this.email,
        role: this.role,
        avatar: this.avatar,
        cart: this._doc.cart,
        fullname: this.fullname,
        dateOfBirth: this.dateOfBirth,
        sex: this.sex,
        nationality: this.nationality,
        warehouseId: this.warehouseId
    }
    this.token = jwt.sign(payload, process.env.JWT, { expiresIn: process.env.JWT_EXPIRE_IN });
    this.save();

    return this.token
}

const User = mongoose.model('users', UserSchema);

module.exports.User = User;