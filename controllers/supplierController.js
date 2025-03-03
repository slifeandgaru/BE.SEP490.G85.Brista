const { Supplier } = require("../models/supplier");
const multer  = require('multer');
const path = require('path');
const fs = require('fs');

exports.createNewSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.create(req.body);
        res.status(200).json({supplier});
    } catch (error) {
        if(error.code === 11000) return res.status(400).json({message: 'this supplier is used'});
        res.status(500).json({message: 'server error', error});
    }
}

exports.getAllSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.find();
        res.status(200).json({supplier});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

exports.getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.supplierId);
        res.status(200).json({supplier});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

exports.findSupplierByRegex = async (req, res) => {
    try {
        const supplier = await Supplier.find({supplierName: {$regex: req.query.supplierName, $options: 'i'}});
        res.status(200).json({supplier});
    } catch (error) {
        res.status(500).json({message: 'server error', error});
    }
}

exports.updateSupplierInfo = async (req, res) => {
    try {
        const supplier = await Supplier.findOneAndUpdate({_id: req.params.supplierId}, {supplierName: req.body.supplierName}, {new: true, runValidators: true});
        res.status(200).json({supplier});
    } catch (error) {
        if(error.code === 11000) return res.status(400).json({message: 'this supplier is used'});
        res.status(500).json({message: 'server error', error});
    }
}

exports.deleteSupplierById = async (req, res) => {
    try {
        const { supplierId } = req.body; // Lấy ID từ body thay vì URL

        if (!supplierId) {
            return res.status(400).json({ message: 'Supplier ID is required' });
        }

        const supplier = await Supplier.findByIdAndDelete(supplierId);
        
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        res.status(200).json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
