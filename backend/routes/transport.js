const express = require('express');
const { protect } = require('../middleware/auth');
const { getRoutes, addRoute, updateRoute, deleteRoute } = require('../controllers/transportController');
const router = express.Router();

router.use(protect);
router.get('/', getRoutes);
router.post('/', addRoute);
router.put('/:id', updateRoute);
router.delete('/:id', deleteRoute);

module.exports = router;
