// ============================================
// FILE: backend/routes/items.js (FIXED VERSION)
// ============================================
const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const { protect } = require('../middleware/auth');
const { generateQRCode } = require('../utils/qrGenerator');
const { validateItem, validateItemUpdate, validateSearch, validateScan, validateObjectId } = require('../middleware/validation');

// @route   GET /api/items
// @desc    Get all items for the current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // FIXED: Only get items created by current user
    const items = await Item.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/items/search
// @desc    Search items for current user
// @access  Private
router.get('/search', protect, validateSearch, async (req, res) => {
  try {
    const { q } = req.query;
    // FIXED: Search only in user's items
    const items = await Item.find({
      createdBy: req.user._id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   GET /api/items/:id
// @desc    Get single item
// @access  Private
router.get('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    // FIXED: Check if item belongs to user
    const item = await Item.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found or access denied' });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/items
// @desc    Create new item
// @access  Private
router.post('/', protect, validateItem, async (req, res) => {
  try {
    const itemData = {
      ...req.body,
      createdBy: req.user._id  // Assign to current user
    };

    const item = new Item(itemData);

    // Generate QR code
    const qrData = {
      id: item._id,
      sku: item.sku,
      name: item.name,
      userId: req.user._id  // Include user ID in QR
    };
    item.qrCode = await generateQRCode(qrData);

    const savedItem = await item.save();

    // Create transaction record
    await Transaction.create({
      item: savedItem._id,
      itemName: savedItem.name,
      sku: savedItem.sku,
      type: 'add',
      quantity: savedItem.quantity,
      previousQuantity: 0,
      newQuantity: savedItem.quantity,
      notes: 'Initial stock',
      performedBy: req.user._id
    });

    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   PUT /api/items/:id
// @desc    Update item
// @access  Private
router.put('/:id', protect, validateObjectId('id'), validateItemUpdate, async (req, res) => {
  try {
    // FIXED: Check if item belongs to user
    const item = await Item.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found or access denied' });
    }

    const previousQuantity = item.quantity;
    Object.assign(item, req.body);
    const updatedItem = await item.save();

    // Create transaction if quantity changed
    if (previousQuantity !== updatedItem.quantity) {
      const difference = updatedItem.quantity - previousQuantity;
      await Transaction.create({
        item: updatedItem._id,
        itemName: updatedItem.name,
        sku: updatedItem.sku,
        type: difference > 0 ? 'add' : 'remove',
        quantity: Math.abs(difference),
        previousQuantity,
        newQuantity: updatedItem.quantity,
        notes: 'Manual adjustment',
        performedBy: req.user._id
      });
    }

    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// @route   DELETE /api/items/:id
// @desc    Delete item
// @access  Private
router.delete('/:id', protect, validateObjectId('id'), async (req, res) => {
  try {
    // FIXED: Check if item belongs to user
    const item = await Item.findOne({
      _id: req.params.id,
      createdBy: req.user._id
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found or access denied' });
    }
    
    await item.deleteOne();
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// @route   POST /api/items/scan
// @desc    Scan QR code and update item
// @access  Private
router.post('/scan', protect, validateScan, async (req, res) => {
  try {
    const { sku, action, quantity } = req.body;
    
    // FIXED: Find item belonging to current user
    const item = await Item.findOne({ 
      sku: sku,
      createdBy: req.user._id
    });

    if (!item) {
      return res.status(404).json({ 
        message: 'Item not found or does not belong to you' 
      });
    }

    const previousQuantity = item.quantity;

    if (action === 'add') {
      item.quantity += parseInt(quantity || 0);
    } else if (action === 'remove') {
      item.quantity -= parseInt(quantity || 0);
      if (item.quantity < 0) item.quantity = 0;
    }

    item.lastScanned = new Date();
    await item.save();

    // Create transaction
    if (action !== 'view') {
      await Transaction.create({
        item: item._id,
        itemName: item.name,
        sku: item.sku,
        type: action,
        quantity: Math.abs(quantity || 0),
        previousQuantity,
        newQuantity: item.quantity,
        notes: 'QR scan',
        performedBy: req.user._id
      });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;