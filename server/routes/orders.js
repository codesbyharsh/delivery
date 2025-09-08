const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Get available orders by pincode
router.get('/available/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const orders = await Order.find({ 
      'shippingAddress.pincode': pincode,
      orderStatus: 'Placed'
    })
    .populate('user', 'name mobile')
    .populate('items.product', 'name');
    
    res.json(orders);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update order status
router.post('/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, rider } = req.body;
    
    const updateData = { orderStatus: status };
    
    if (status === 'Delivered') {
      updateData.deliveredBy = rider;
      updateData.deliveredAt = new Date();
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    );
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    res.json({ message: 'Order status updated', order });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

module.exports = router;