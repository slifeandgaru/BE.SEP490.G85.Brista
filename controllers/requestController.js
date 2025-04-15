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
      const { search = "", status, page = 1, limit = 5 } = req.query;

      const query = {};
      if (status) query.status = status;
      if (search) query["toWarehouseId.warehouseName"] = { $regex: search, $options: "i" };

      const requests = await Request.find(query)
          .populate("toWarehouseId")
          .populate("fromWarehouseId")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(Number(limit));

      const total = await Request.countDocuments(query);

      res.status(200).json({ requests, total });
  } catch (error) {
      console.error("getAllRequests error:", error);
      res.status(500).json({ message: "Server error", error });
  }
};
