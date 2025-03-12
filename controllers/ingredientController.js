const Ingredient = require('../models/Ingredient');

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
        const { batchCode } = req.body;
        const existingIngredient = await Ingredient.findOne({ batchCode });
        if (existingIngredient) {
            return res.status(400).json({ message: 'Batch code already exists' });
        }
        
        const newIngredient = new Ingredient(req.body);
        await newIngredient.save();
        res.status(201).json({ message: 'Ingredient created successfully', ingredient: newIngredient });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
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
