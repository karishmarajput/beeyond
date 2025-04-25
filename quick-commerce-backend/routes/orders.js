const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const authMiddleware = require('../middleware/authMiddleware');
router.post('/', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !== 'customer'){
      return res.status(403).json({ message: "Access denied. Only customers can place orders." });
    }
    const { product, quantity, location } = req.body;
    const order = new Order({
      customerId: req.user.id,
      product,
      quantity,
      location
    });
    await order.save();

    req.io.emit("orderUpdated", order);
    res.status(201).json(order);
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/customer/:id', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.params.id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/history/:userId', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({
      $or: [
        { customerId: req.params.userId },
        { deliveryPartnerId: req.params.userId }
      ]
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get('/pending', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !== 'delivery'){
      return res.status(403).json({ message: "Access denied. Only delivery partners allowed." });
    }
    const orders = await Order.find({ status: "Pending" });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    if(req.user.role !== 'delivery'){
      return res.status(403).json({ message: "Access denied. Only delivery partners can update status." });
    }
    const { status, deliveryPartnerId } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status, deliveryPartnerId },
      { new: true }
    );
    
    if (req.io) {
      req.io.emit("orderUpdated", order);
    }

    res.json(order);
  } catch (error) {
    console.error("Update Order Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
