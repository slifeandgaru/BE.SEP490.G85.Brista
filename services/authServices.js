// const { Cart } = require("../models/cart");
const { User } = require("../models/user")

exports.checkEmailAndPassword = async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        // console.log(user)
        if(!user) return {error: 'wrong email'};
        const check = await user.verifyPassword(req.body.password);
        if(!check) return {error: 'wrong password'};

        // const cart = await Cart.findOne({userId: user._id});
        // user._doc.cart = cart;
        return {user}
    } catch (error) {
        return {error};
    }
}