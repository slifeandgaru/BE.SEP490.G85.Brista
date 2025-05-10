// const { Cart } = require("../models/cart");
const { User } = require("../models/user")

exports.checkPhoneAndPassword = async (req, res) => {
    try {
        const user = await User.findOne({phone: req.body.phone})
        if(!user) return {error: 'wrong phone'};
        const check = await user.verifyPassword(req.body.password);
        
        console.log(check)
        if(!check) return {error: 'wrong password'};

        // const cart = await Cart.findOne({userId: user._id});
        // user._doc.cart = cart;
        return {user}
    } catch (error) {
        return {error};
    }
}