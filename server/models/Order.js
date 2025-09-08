const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variantIndex: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    priceAtOrder: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI'],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  cancellationReason: String,
  cancellationRequested: {
    type: Boolean,
    default: false
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number]
  }
}, { timestamps: true });

// Create and export the model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;