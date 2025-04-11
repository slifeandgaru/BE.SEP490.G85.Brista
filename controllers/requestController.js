const Request = require('../models/request');

exports.createRequest = async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    const saved = await newRequest.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Tạo request thất bại', error: err.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await Request.find().populate('items.ingredientId');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lấy request', error: err.message });
  }
};
