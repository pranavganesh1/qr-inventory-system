const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');

// @route   GET /api/transactions
// @desc    Get all transactions
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('item')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/transactions/item/:itemId
// @desc    Get transactions for specific item
// @access  Private
router.get('/item/:itemId', protect, async (req, res) => {
  try {
    const transactions = await Transaction.find({ item: req.params.itemId })
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;