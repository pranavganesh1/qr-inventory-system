const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    default: 0,
    min: [0, 'Quantity cannot be negative']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  reorderPoint: {
    type: Number,
    default: 10,
    min: 0
  },
  supplier: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  qrCode: {
    type: String // Base64 encoded QR code
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock', 'Critical'],
    default: 'In Stock'
  },
  lastScanned: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Middleware to update status based on quantity
itemSchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.reorderPoint / 2) {
    this.status = 'Critical';
  } else if (this.quantity <= this.reorderPoint) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

// Index for faster searches
itemSchema.index({ sku: 1, name: 1 });

module.exports = mongoose.model('Item', itemSchema);