const axios = require('axios');
const { getSpeedShipToken } = require('../services/tokenService'); // adjust path if needed
require('dotenv').config();

async function createShipment(payload) {
  const token = await getSpeedShipToken();
  const apiBase = process.env.SPEEDSHIP_API_BASE;
  const url = `${apiBase}/orders/create`;

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (err) {
    console.error("createShipment error:", err.message);
    throw err;
  }
}

module.exports = { createShipment };
