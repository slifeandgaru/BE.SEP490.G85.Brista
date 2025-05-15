const Product = require('../models/product');
const Ingredient = require('../models/ingredient');
const Warehouse = require("../models/warehouse");

// Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

// Lấy danh sách sản phẩm (có phân trang)
exports.getAllProducts = async (req, res) => {
    try {
      let { page, limit, warehouseId } = req.query;
      page = parseInt(page) || 1;
      limit = parseInt(limit) || 10;
      const skip = (page - 1) * limit;
  
      const products = await Product.find()
        .populate("categoryId")
        .populate("listIngredient.ingredientId") // Phải populate để lấy baseUnit + conversionRate
        .skip(skip)
        .limit(limit);
  
      const total = await Product.countDocuments();
  
      if (warehouseId) {
        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
          return res.status(404).json({ message: "Warehouse not found" });
        }
  
        // Tạo map nguyên liệu trong kho
        const ingredientMap = {};
        warehouse.listIngredient.forEach((item) => {
          ingredientMap[item.ingredientId.toString()] = {
            quantity: item.quantity,
            unit: item.unit,
          };
        });
  
        // Kiểm tra từng sản phẩm
        for (const product of products) {
          let isAvailable = true;
  
          for (const ing of product.listIngredient) {
            if (!ing.ingredientId) {
              console.log(`❌ Ingredient bị thiếu thông tin trong product: ${product.productName}`);
              isAvailable = false;
              break;
            }
  
            const ingId = ing.ingredientId._id.toString();
            const requiredQty = ing.quantity;
  
            const ingInfo = ing.ingredientId;
            const baseUnit = ingInfo.baseUnit;
            const conversionRates = ingInfo.conversionRate || [];
  
            const warehouseItem = ingredientMap[ingId];
  
            // ❌ Nguyên liệu không tồn tại trong kho
            if (!warehouseItem) {
              console.log(`⚠️ Nguyên liệu ${ingInfo.ingredientName} không có trong kho`);
              isAvailable = false;
              break;
            }
  
            let warehouseQtyInBase = warehouseItem.quantity;
  
            // ✅ Nếu đơn vị trong kho khác baseUnit thì chuyển đổi
            if (warehouseItem.unit !== baseUnit) {
              const convert = conversionRates.find(
                (c) => c.unit === warehouseItem.unit
              );
  
              if (!convert) {
                console.log(`⚠️ Không tìm thấy conversionRate cho đơn vị ${warehouseItem.unit} của ${ingInfo.ingredientName}`);
                isAvailable = false;
                break;
              }
  
              warehouseQtyInBase *= convert.rate; // chuyển về baseUnit
            }
  
            // ❌ Nếu không đủ nguyên liệu
            if (warehouseQtyInBase < requiredQty) {
              console.log(`⚠️ Không đủ ${ingInfo.ingredientName} cho sản phẩm ${product.productName}`);
              isAvailable = false;
              break;
            }
          }
  
          product._doc.isAvailable = isAvailable; // Gắn flag cho FE dùng
        }
      }
  
      res.status(200).json({ message: "Get all product success", total, page, limit, products });
  
    } catch (error) {
      console.log("🔥 Lỗi khi load sản phẩm:", error);
      res.status(500).json({ message: "Error retrieving products", error });
    }
  };

// Lấy sản phẩm theo ID
exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId)
            .populate('categoryId', 'categoryName')
            .populate('listIngredient.ingredientId', 'ingredientName unit')
            .populate('feedback.userId', 'username')
            .populate('coupon.couponId', 'couponCode discount');

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving product', error });
    }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.productId,
            req.body,
            { new: true }
        ).populate('categoryId', 'categoryName');

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.productId);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};

//thêm nguyên liệu vào trong sản phẩm
exports.addIngredientToProduct = async (req, res) => {
    try {
        const { productId, ingredientId, quantity } = req.body;

        if (!productId || !ingredientId || !quantity) {
            return res.status(400).json({ message: "Thiếu thông tin đầu vào." });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Không tìm thấy sản phẩm." });
        }

        // Kiểm tra ingredient có tồn tại không
        const ingredient = await Ingredient.findById(ingredientId);
        if (!ingredient) {
            return res.status(404).json({ message: "Không tìm thấy nguyên liệu." });
        }

        // Kiểm tra ingredient đã tồn tại trong danh sách chưa
        const existingIngredient = product.listIngredient.find(item => item.ingredientId.toString() === ingredientId);

        if (existingIngredient) {
            // Nếu đã có, thì cập nhật số lượng
            existingIngredient.quantity += quantity;
        } else {
            // Nếu chưa có, thì thêm mới
            product.listIngredient.push({ ingredientId, quantity });
        }

        await product.save();
        return res.status(200).json({ message: "Thêm nguyên liệu thành công.", product });
    } catch (error) {
        return res.status(500).json({ message: "Lỗi server.", error: error.message });
    }
};

exports.getAllProductsByCategoryId = async (req, res) => {
  try {
    console.log("abc")
      const { categoryId } = req.params;

      if (!categoryId) {
          return res.status(400).json({ message: 'Category ID is required' });
      }

      const products = await Product.find({ categoryId })
          // .populate('categoryId') // nếu muốn thông tin category
          // .populate('listIngredient.ingredientId') // nếu muốn thông tin nguyên liệu
          // .populate('feedback.userId') // nếu muốn user feedback
          // .populate('coupon.couponId'); // nếu muốn thông tin coupon

      res.status(200).json(products);
  } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

const calculateProductStorage = async (product, warehouseIngredients, Ingredient) => {
    const requiredIngredients = product.listIngredient;
    const productCountList = [];

    for (const required of requiredIngredients) {
        const { ingredientId, quantity: requiredQty, unit: requiredUnit } = required;

        const warehouseEntry = warehouseIngredients.find(entry =>
            entry.ingredientId.toString() === ingredientId.toString()
        );

        if (!warehouseEntry) return 0;

        let availableQty = warehouseEntry.quantity;
        const availableUnit = warehouseEntry.unit;

        if (requiredUnit !== availableUnit) {
            const ingredient = await Ingredient.findById(ingredientId);
            const conversion = ingredient.conversionRate.find(rate => rate.unit === availableUnit);
            if (!conversion || !conversion.rate) return 0;
            availableQty *= conversion.rate;
        }

        const possibleCount = Math.floor(availableQty / requiredQty);
        productCountList.push(possibleCount);
    }

    return Math.min(...productCountList);
};

exports.getAllProductsWithStorage = async (req, res) => {
    try {
        const { warehouseId } = req.query;
        if (!warehouseId) {
            return res.status(400).json({ success: false, message: 'warehouseId is required' });
        }

        const warehouse = await Warehouse.findById(warehouseId);
        if (!warehouse) {
            return res.status(404).json({ success: false, message: 'Warehouse not found' });
        }

        const products = await Product.find().populate('categoryId');

        const productWithStorage = await Promise.all(products.map(async (product) => {
            const totalStorage = await calculateProductStorage(product, warehouse.listIngredient, Ingredient);
            return {
                ...product.toObject(),
                totalStorage
            };
        }));

        return res.json({ success: true, data: productWithStorage });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

