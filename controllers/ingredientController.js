const Ingredient = require('../models/ingredient');

// Get all ingredients with pagination
exports.getAllIngredients = async (req, res) => {
    try {
        let { page, limit } = req.query;
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const skip = (page - 1) * limit;

        const ingredients = await Ingredient.find().skip(skip).limit(limit);
        const total = await Ingredient.countDocuments();

        res.status(200).json({
            ingredients,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Get ingredient by ID
exports.getIngredientById = async (req, res) => {
    try {
        const ingredient = await Ingredient.findById(req.params.id);
        if (!ingredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }
        res.status(200).json({ ingredient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create a new ingredient
exports.createIngredient = async (req, res) => {
    try {
        console.log("File received:", req.file);

        // Lấy dữ liệu từ request body
        const { ingredientName, baseUnit, ingredientCode, expiration, conversionRate } = req.body;
        
        // Kiểm tra nếu rate là mảng hợp lệ
        // const validRate = Array.isArray(conversionRate) && conversionRate.every(r => r.unit && r.conversionRate);

        // if (!validRate) {
        //     return res.status(400).json({ message: "Invalid rate format" });
        // }

        // Tạo batchCode từ ingredientCode + ngày tháng hiện tại
        const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const batchCode = `${ingredientCode}-${currentDate}`;

        // Kiểm tra xem batchCode đã tồn tại chưa
        const existingIngredient = await Ingredient.findOne({ batchCode });
        if (existingIngredient) {
            return res.status(400).json({ message: "Batch code already exists" });
        }

        // if (conversionRate) {
        //     conversionRate = JSON.parse(conversionRate);
        // }

        // Lưu đường dẫn ảnh (nếu có)
        let thump = req.file?.path || "https://cdn-icons-png.flaticon.com/512/1261/1261163.png";

        // Tạo mới nguyên liệu
        const newIngredient = new Ingredient({
            ingredientName,
            baseUnit,
            ingredientCode,
            batchCode,
            expiration,
            conversionRate,
            thump,
        });

        await newIngredient.save();

        res.status(201).json({ message: "Ingredient created successfully", ingredient: newIngredient });
    } catch (error) {
        console.error("Error creating ingredient:", error);
        res.status(500).json({ message: "Server error", error });
    }
};

// Update ingredient by ID
exports.updateIngredient = async (req, res) => {
    try {
        const updatedIngredient = await Ingredient.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedIngredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }
        res.status(200).json({ message: 'Ingredient updated successfully', ingredient: updatedIngredient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Delete ingredient by ID
exports.deleteIngredient = async (req, res) => {
    try {
        const deletedIngredient = await Ingredient.findByIdAndDelete(req.params.id);
        if (!deletedIngredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }
        res.status(200).json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Add a new unit conversion to an ingredient
exports.addUnitToIngredient = async (req, res) => {
    try {
        const { unit, value } = req.body;

        if (!unit || !value) {
            return res.status(400).json({ message: 'unit and value are required' });
        }

        const updatedIngredient = await Ingredient.findByIdAndUpdate(
            req.params.id,
            { $push: { rate: { unit, value } } },
            { new: true }
        );

        if (!updatedIngredient) {
            return res.status(404).json({ message: 'Ingredient not found' });
        }

        res.status(200).json({ message: 'Unit added successfully', ingredient: updatedIngredient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

