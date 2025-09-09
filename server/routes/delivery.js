// server/routes/delivery.js
const express = require('express');
const Order = require('../models/Order');
const Pincode = require('../models/Pincode');
const Rider = require('../models/Rider');

const router = express.Router();

// existing: get orders by pincode
router.get('/orders/:pincode', async (req, res) => {
  try {
    const { pincode } = req.params;
    const orders = await Order.find({
      'shippingAddress.pincode': pincode,
      orderStatus: { $in: ['Placed', 'Out for Delivery'] }
    })
    .populate('user', 'name mobile')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.error('Error fetching delivery orders:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// ADD to bucket
// body: { riderId }
// POST /api/delivery/bucket/:orderId/add  -> body: { riderId }
router.post('/bucket/:orderId/add', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;
    const order = await Order.findByIdAndUpdate(orderId, {
      inBucketList: true,
      bucketedBy: riderId
    }, { new: true });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    // push to rider's bucketList
    if (riderId) {
      await Rider.findByIdAndUpdate(riderId, { $addToSet: { bucketList: order._id } });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Error adding to bucket:', err);
    res.status(500).json({ error: 'Failed to add to bucket' });
  }
});

// POST /api/delivery/bucket/:orderId/remove -> body: { riderId }
router.post('/bucket/:orderId/remove', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { riderId } = req.body;

    const order = await Order.findByIdAndUpdate(orderId, {
      inBucketList: false,
      bucketedBy: null
    }, { new: true });

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (riderId) {
      await Rider.findByIdAndUpdate(riderId, { $pull: { bucketList: order._id } });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    console.error('Error removing from bucket:', err);
    res.status(500).json({ error: 'Failed to remove from bucket' });
  }
});


module.exports = router;
