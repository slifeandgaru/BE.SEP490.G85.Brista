const WarehouseProduct = require("../models/warehouseProduct");

exports.createWarehouseProduct = async (req, res) => {
    try {
        const { warehouseId, productId } = req.body;

        const existingProduct = await WarehouseProduct.findOne({ productId });
        if (existingProduct) {
            return res.status(400).json({ message: "Product already exists!" });
        }

        const newWarehouProduct = new WarehouseProduct({ warehouseId, productId });
        await newWarehouProduct.save();
        res.status(201).json({ message: 'Warehouse created successfully', warehouse_product: newWarehouProduct });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};