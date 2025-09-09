// server/models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantIndex: { type: Number, required: true },
    quantity: { type: Number, required: true },
    priceAtOrder: { type: Number, required: true }
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
  totalAmount: { type: Number, required: true },

  // ✅ Expanded order statuses
  orderStatus: {
    type: String,
    enum: [
      'Order Placed',
      'Packed / Processing',
      'Shipped / Dispatched',
      'Out for Delivery',
      'Delivered',
      'Cancelled'
    ],
    default: 'Order Placed'
  },

  cancellationReason: String,
  cancellationRequested: { type: Boolean, default: false },
  trackingNumber: String,
  estimatedDelivery: Date,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },

  // ✅ Bucketlist tracking
  inBucketList: { type: Boolean, default: false },
  bucketedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Rider', default: null },

  // ✅ Lifecycle timestamps
  placedAt: { type: Date, default: Date.now },
  packedAt: Date,
  shippedAt: Date,
  outForDeliveryAt: Date,
  deliveredAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
