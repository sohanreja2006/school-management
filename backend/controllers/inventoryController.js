const Asset = require('../models/Asset');

// @desc    Get all assets
// @route   GET /api/inventory
exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find({ schoolId: req.user.schoolId });
    res.status(200).json({ success: true, data: assets });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Add an asset
// @route   POST /api/inventory
exports.addAsset = async (req, res) => {
  try {
    const asset = await Asset.create({
      ...req.body,
      schoolId: req.user.schoolId
    });
    res.status(201).json({ success: true, data: asset });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
