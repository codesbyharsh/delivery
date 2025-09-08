const express = require('express');
const Order = require('../models/Order'); // Make sure this path is correct
const Pincode = require('../models/Pincode'); // Make sure this path is correct

const router = express.Router();

// Get orders by pincode
router.get('/orders/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    console.log('Fetching delivery orders for pincode:', pincode);
    
    const orders = await Order.find({
      'shippingAddress.pincode': pincode,
      orderStatus: { $in: ['Placed', 'Out for Delivery'] }
    })
    .populate('user', 'name mobile')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 });
    
    console.log('Delivery orders found:', orders.length);
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching delivery orders:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Update order status (for delivery partners)
router.put('/orders/:id', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Validate the status
    const validStatuses = ['Placed', 'Out for Delivery', 'Delivered', 'Cancelled', 'Queue for Tomorrow'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    
    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Error updating order status:', err);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

module.exports = router;