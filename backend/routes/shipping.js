const express = require('express');
const router = express.Router();
const { getRates } = require('../speedship/shopFlow');
const { createShipment } = require('../speedship/integratedOrderFlow');
const { schedulePickup } = require('../speedship/schedulePickupFlow');

router.post('/get-rates', async (req, res) => {
  try {
    const data = await getRates(req.body);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to get rates' });
  }
});

router.post('/create-shipment', async (req, res) => {
  try {
    const data = await createShipment(req.body);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to create shipment' });
  }
});

router.post('/schedule-pickup', async (req, res) => {
  try {
    const data = await schedulePickup(req.body);
    res.json(data);
  } catch {
    res.status(500).json({ error: 'Failed to schedule pickup' });
  }
});

module.exports = router;
