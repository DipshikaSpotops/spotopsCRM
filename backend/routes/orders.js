const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderNo = require('../models/OrderNo');
const authMiddleware = require('../middleware/auth');

// Track team assignment
let currentTeam = 'Mark';

// Route to fetch all orders
router.get('/', async (req, res) => {
    try {
        const orders = await Order.find({});
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching orders', error: err.message });
    }
});

// Route to fetch team-specific orders
router.get('/team/:teamName', async (req, res) => {
    try {
        const teamName = req.params.teamName;
        const orders = await Order.find({ team: teamName });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching team orders', error: err.message });
    }
});

// Route to create a new order
router.post('/', authMiddleware, async (req, res) => {
    const newOrder = new Order(req.body);
    console.log("newOrder-orders.js",newOrder); 
    newOrder.team = currentTeam; // Assign current team

    try {
        await newOrder.save();
        res.json(newOrder);

        // Alternate team for next order
        currentTeam = currentTeam === 'Mark' ? 'Sussane' : 'Mark';
    } catch (err) {
        res.status(500).json({ msg: 'Error creating order', error: err.message });
    }
});

// Route to update an existing order
router.put('/:orderNo', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOneAndUpdate({ orderNo: req.params.orderNo }, req.body, { new: true });
        res.json(order);
    } catch (err) {
        res.status(500).json({ msg: 'Error updating order', error: err.message });
    }
});

// Route to delete an order and save it as canceled
router.delete('/:orderNo', authMiddleware, async (req, res) => {
    try {
        const order = await Order.findOneAndDelete({ orderNo: req.params.orderNo });
        if (order) {
            order.isCancelled = true; // Add a field to mark the order as cancelled
            await Order.create(order); // Save the cancelled order
            res.json({ msg: 'Order deleted and saved as cancelled' });
        } else {
            res.status(404).json({ msg: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ msg: 'Error deleting order', error: err.message });
    }
});

// Route to fetch cancelled orders
router.get('/cancelled', authMiddleware, async (req, res) => {
    try {
        const cancelledOrders = await Order.find({ isCancelled: true });
        res.json(cancelledOrders);
    } catch (err) {
        res.status(500).json({ msg: 'Error fetching cancelled orders', error: err.message });
    }
});

// Endpoint to fetch the highest order number
router.get('/highestOrderNo', async (req, res) => {
    console.log("getting latest order");
    try {
      const orderNoDoc = await OrderNo.findOne();
      if (!orderNoDoc) {
        // Initialize the order number if it doesn't exist
        const newOrderNoDoc = new OrderNo({ latestOrderNo: '50STARS0000' });
        await newOrderNoDoc.save();
        res.json({ highestOrderNo: '50STARS0000' });
      } else {
        res.json({ highestOrderNo: orderNoDoc.latestOrderNo });
      }
    } catch (err) {
      console.error('Error fetching highest order number:', err);
      res.status(500).json({ message: 'Error fetching highest order number', error: err.message });
    }
  });
  

router.post('/sendInvoice/:orderNo', authMiddleware, async (req, res) => {
    // Implement sending invoice logic here
    res.json({ msg: 'Invoice sent successfully' });
});

module.exports = router;
