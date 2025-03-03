// const { Cart } = require("../models/cart");
const { User } = require("../models/user");
const { checkEmailAndPassword } = require("../services/authServices");

exports.createNewUser = async (req, res) => {
    try {
        const newUser = await User.create(req.body);
        // await Cart.create({userId: newUser._id});
        res.status(200).json({message: 'create success'});
    } catch (error) {
        if(error.code === 11000) return res.status(400).json({message: `${Object.keys(error.keyValue)[0]} is used`, error});
        res.status(500).json({message: 'server error', error});
    }
}

exports.loginUser = async (req, res) => {
    try {
        // console.log(18, req.body);
        const user = await checkEmailAndPassword(req, res);
        if(user.error) return res.status(400).json({message: user.error});

        const token = user.user.createToken();
        res.status(200).json({message: 'login success', token});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

exports.getMyInfo = async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user.id}).populate('shop').select(['-password', '-token']);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

// exports.loginToShop = async (req, res) => {
//     try {
//         // console.log(40, req.body);
//         const user = await checkEmailAndPassword(req, res);
//         if(user.error) return res.status(400).json({message: user.error});

//         if(!user.user.shop) return res.status(400).json({message: `you don't have a shop yet, please create a shop first`});
        
//         const token = user.user.createToken();
//         res.status(200).json({message: 'login success', token});
//     } catch (error) {
//         res.status(500).json({message: 'server error', error});
//     }
// }

exports.adminLogin = async (req, res) => {
    try {
        // console.log(55, req.body);
        const user = await checkEmailAndPassword(req, res);
        if(user.error) return res.status(400).json({message: user.error});

        if(user.user.role !== 'admin') return res.status(400).json({message: `you don't have permission to login to this page`})
        
        const token = user.user.createToken();
        res.status(200).json({message: 'login success', token});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}