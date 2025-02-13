const Test = require("../models/test")

exports.shopCreateNewProduct = async (req, res) => {
    try {
        const userId = req.body.userId;
        const newProduct = await Test.create({userId});
        res.status(200).json({newProduct});
    } catch (error) {
        if(error.code = 11000) return res.status(400).json({message: 'product name is used, choose another name'});
        res.status(500).json({message: 'server error', error});
    }
}