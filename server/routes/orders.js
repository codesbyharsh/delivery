// server/routes/orders.js
const express = require('express');
const Order = require('../models/Order');

const router = express.Router();

// Get all orders with populated user and product data
router.get('/', async (req, res) => {
  try {
    const { from, to } = req.query;
    const filter = {};
    
    if (from || to) {
      filter.estimatedDelivery = {};
      if (from) filter.estimatedDelivery.$gte = new Date(from);
      if (to) filter.estimatedDelivery.$lte = new Date(to);
    }
    
    const orders = await Order.find(filter)
      .populate('user', 'name mobile')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    
    const data = orders.map(o => ({
      ...o._doc,
      timestamps: {
        Placed: o.createdAt,
        Processing: o.updatedAt,
        Shipped: o.shippedAt,
        'Out for Delivery': o.outForDeliveryAt,
        Delivered: o.deliveredAt
      }
    }));
    
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// New: Get available orders for a specific pincode (returns plain array)
router.get('/available/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    console.log('Fetching available orders for pincode:', pincode);

    const orders = await Order.find({
      'shippingAddress.pincode': pincode,
      orderStatus: { $in: ['Placed', 'Out for Delivery'] }
    })
      .populate('user', 'name mobile')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });

    console.log('Found orders:', orders.length);
    // return plain array (frontend expects array)
    res.json(orders);
  } catch (error) {
    console.error('Error fetching available orders:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch available orders' });
  }
});

// New: Update order status via POST /:orderId/status
router.post('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, rider } = req.body;

    const validStatuses = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Queue for Tomorrow'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const update = { orderStatus: status };

    // maintain timestamps
    if (status === 'Shipped') update.shippedAt = new Date();
    if (status === 'Out for Delivery') update.outForDeliveryAt = new Date();
    if (status === 'Delivered') {
      update.deliveredAt = new Date();
      if (rider) update.deliveredBy = rider;
    }
    if (status === 'Cancelled') update.cancellationRequested = false;

    const order = await Order.findByIdAndUpdate(orderId, update, { new: true })
      .populate('user', 'name mobile')
      .populate('items.product', 'name');

    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

router.put('/:orderId', async (req, res) => {
  try {
    const { orderStatus, estimatedDelivery, paymentStatus, cancellationRequested } = req.body;
    const update = {};
    
    if (orderStatus) {
      update.orderStatus = orderStatus;
      if (orderStatus === 'Shipped') update.shippedAt = new Date();
      if (orderStatus === 'Out for Delivery') update.outForDeliveryAt = new Date();
      if (orderStatus === 'Delivered') update.deliveredAt = new Date();
    }
    
    if (estimatedDelivery) update.estimatedDelivery = new Date(estimatedDelivery);
    if (paymentStatus) update.paymentStatus = paymentStatus;
    if (cancellationRequested !== undefined) update.cancellationRequested = cancellationRequested;

    const order = await Order.findByIdAndUpdate(req.params.orderId, update, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, error: 'Failed to update order' });
  }
});

module.exports = router;
