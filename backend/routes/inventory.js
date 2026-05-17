const express = require('express');
const { protect } = require('../middleware/auth');
const { getAssets, addAsset } = require('../controllers/inventoryController');
const router = express.Router();

router.use(protect);
router.get('/', getAssets);
router.post('/', addAsset);

module.exports = router;
