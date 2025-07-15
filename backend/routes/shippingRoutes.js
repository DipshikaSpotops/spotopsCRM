const express = require('express');
const router = express.Router();

const { getRates } = require('../speedship/shopFlow');
const { createShipment } = require('../speedship/integratedOrderFlow');
const { schedulePickup } = require('../speedship/schedulePickupFlow');

router.post('/get-rates', async (req, res) => {
  try {
    console.log("Received /get-rates with body:", req.body); // ✅ log input
    const data = await getRates(req.body);
    res.json(data);
  } catch (err) {
    console.error("Error in /get-rates:", err); // ✅ log error
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-shipment', async (req, res) => {
  try {
    console.log("Received /create-shipment with body:", req.body);
    const data = await createShipment(req.body);
    res.json(data);
  } catch (err) {
    console.error("Error in /create-shipment:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/schedule-pickup', async (req, res) => {
  try {
    console.log("Received /schedule-pickup with body:", req.body);
    const data = await schedulePickup(req.body);
    res.json(data);
  } catch (err) {
    console.error("Error in /schedule-pickup:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
