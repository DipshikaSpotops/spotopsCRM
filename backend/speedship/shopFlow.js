const axios = require('axios');
const { getSpeedShipToken } = require('../services/tokenService'); // adjust path as needed
require('dotenv').config();

async function getRates(payload) {
  const token = await getSpeedShipToken();

  const apiBase = process.env.SPEEDSHIP_API_BASE; // Should be set like: https://api.sandbox.speedship.io/v1
  const url = `${apiBase}/shop/rates`; // Confirm with your SpeedShip doc

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (err) {
    console.error("shopFlow error:", err.message);
    throw err;
  }
}

module.exports = { getRates };
