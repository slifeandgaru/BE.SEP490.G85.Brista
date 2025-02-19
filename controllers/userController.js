const {User} = require('../models/user');
const bcrypt = require('bcrypt');
const fs = require('fs');

exports.getAllUser = async (req, res) => {
    try {
        const listUser = await User.find().select(['-password', '-token']);
        res.status(200).json({listUser});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

exports.createNewUser = async (req, res) => {
    try {
        const newUser = await User.create({...req.body})
        res.status(200).json({newUser});
    } catch (error) {
        res.status(500).json({message: 'server error', error}); 
    }
}