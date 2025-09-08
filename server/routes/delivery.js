// routes/delivery.js
import express from 'express';
import Order from '../models/Order.js';
import Pincode from '../models/Pincode.js';

const router = express.Router();

// Get orders by pincode
router.get('/orders/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    
    // Find orders with the specified pincode
    const orders = await Order.find({ 
      'shippingAddress.pincode': pincode,
      orderStatus: { $in: ['Placed', 'Out for Delivery'] } // Only show orders that are not delivered or cancelled
    })
    .populate('user', 'name mobile')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 });
    
    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching orders by pincode:', err);
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

export default router;